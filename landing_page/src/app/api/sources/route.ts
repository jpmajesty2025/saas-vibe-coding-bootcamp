import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';
import { z } from 'zod';
import pool from '@/lib/db/client';

export const runtime = 'nodejs';

const requestSchema = z.object({
  query: z.string().min(1).max(500),
});

interface SourceRow {
  content: string;
  metadata: { title: string; source: string; chunk: number };
  similarity: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query } = requestSchema.parse(body);

    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: query,
    });

    const embeddingStr = `[${embedding.join(',')}]`;
    const result = await pool.query<SourceRow>(
      `SELECT content, metadata,
       1 - (embedding <=> $1::vector) AS similarity
       FROM documents
       WHERE 1 - (embedding <=> $1::vector) > 0.5
       ORDER BY embedding <=> $1::vector
       LIMIT 5`,
      [embeddingStr]
    );

    const sources = result.rows.map((row) => ({
      title: row.metadata.title,
      url: row.metadata.source,
      snippet: row.content.slice(0, 350).trim(),
      similarity: Math.round(row.similarity * 100),
    }));

    return Response.json({ sources });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid request' }, { status: 400 });
    }
    console.error('Sources API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
