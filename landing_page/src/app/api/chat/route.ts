import { openai } from '@ai-sdk/openai';
import { streamText, embed } from 'ai';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import pool from '@/lib/db/client';
import { SYSTEM_PROMPT_WITH_CONTEXT, SYSTEM_PROMPT_NO_CONTEXT } from '@/lib/prompts';

export const runtime = 'nodejs';
export const maxDuration = 30;

const messagePartSchema = z.object({
  type: z.string(),
  text: z.string().max(2000).optional(),
});

const uiMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  parts: z.array(messagePartSchema),
});

const requestSchema = z.object({
  messages: z.array(uiMessageSchema).min(1).max(20),
});

interface DocumentRow {
  content: string;
  metadata: { title: string; source: string; chunk: number };
  similarity: number;
}

function extractText(parts: Array<{ type: string; text?: string }>): string {
  return parts
    .filter((p) => p.type === 'text' && p.text)
    .map((p) => p.text!)
    .join('');
}

async function getRelevantContext(query: string): Promise<string> {
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: query,
  });

  const embeddingStr = `[${embedding.join(',')}]`;
  const result = await pool.query<DocumentRow>(
    `SELECT content, metadata,
     1 - (embedding <=> $1::vector) AS similarity
     FROM documents
     WHERE 1 - (embedding <=> $1::vector) > 0.5
     ORDER BY embedding <=> $1::vector
     LIMIT 5`,
    [embeddingStr]
  );

  if (result.rows.length === 0) return '';

  return result.rows
    .map((row, i) => `[Source ${i + 1}: ${row.metadata.title}]\n${row.content}`)
    .join('\n\n---\n\n');
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { messages } = requestSchema.parse(body);

    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUserMessage) {
      return Response.json({ error: 'No user message found' }, { status: 400 });
    }

    const latestUserText = extractText(lastUserMessage.parts);
    if (!latestUserText) {
      return Response.json({ error: 'Empty user message' }, { status: 400 });
    }

    const context = await getRelevantContext(latestUserText);

    const systemPrompt = context
      ? SYSTEM_PROMPT_WITH_CONTEXT(context)
      : SYSTEM_PROMPT_NO_CONTEXT;

    const coreMessages = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: extractText(m.parts),
      }))
      .filter((m) => m.content.length > 0);

    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      messages: coreMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid request', details: error.issues }, { status: 400 });
    }
    console.error('Chat API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
