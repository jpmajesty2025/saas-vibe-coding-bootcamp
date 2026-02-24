// env loading is handled by src/lib/db/client.ts
import pool from '../src/lib/db/client';
import { createOpenAI } from '@ai-sdk/openai';
import { embedMany } from 'ai';

// openai provider is created lazily inside main() after dotenv loads

const SOURCES = [
  {
    title: 'CDC Pink Book Chapter 13: Measles',
    url: 'https://www.cdc.gov/pinkbook/hcp/table-of-contents/chapter-13-measles.html',
    type: 'html' as const,
  },
  {
    title: 'CDC Pink Book Chapter 15: Mumps',
    url: 'https://www.cdc.gov/pinkbook/hcp/table-of-contents/chapter-15-mumps.html',
    type: 'html' as const,
  },
  {
    title: 'CDC Pink Book Chapter 20: Rubella',
    url: 'https://www.cdc.gov/pinkbook/hcp/table-of-contents/chapter-20-rubella.html',
    type: 'html' as const,
  },
  {
    title: 'CDC Clinical Overview of Measles',
    url: 'https://www.cdc.gov/measles/hcp/clinical-overview/index.html',
    type: 'html' as const,
  },
  {
    title: 'CDC Measles Infection Control for Healthcare Personnel',
    url: 'https://www.cdc.gov/infection-control/hcp/healthcare-personnel-epidemiology-control/measles.html',
    type: 'html' as const,
  },
];

const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 100;

function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end).trim());
    start += chunkSize - overlap;
  }
  return chunks.filter((c) => c.length > 50);
}

async function fetchAndExtractText(source: (typeof SOURCES)[0]): Promise<string> {
  log(`  Fetching: ${source.url}`);
  const response = await fetch(source.url);
  if (!response.ok) throw new Error(`Failed to fetch ${source.url}: ${response.statusText}`);

  if (source.type === 'pdf') {
    throw new Error('PDF sources are not supported; use HTML sources only.');
  } else {
    const html = await response.text();
    const cheerio = await import('cheerio');
    const $ = cheerio.load(html);
    $('nav, footer, header, script, style, .nav, .footer, .header').remove();
    return $('main, article, .content, body').text().replace(/\s+/g, ' ').trim();
  }
}

// Route all output to stderr to avoid Windows stdout EPIPE pipe issues
const log = (...args: Parameters<typeof console.log>) => console.error(...args);

async function main() {
  // Initialize openai provider here so env vars are guaranteed loaded by client.ts
  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

  log('Starting RAG ingestion pipeline...\n');

  const client = await pool.connect();
  try {
    log('Ensuring documents table exists and clearing any previous data...');
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS vector;
      CREATE TABLE IF NOT EXISTS documents (
        id BIGSERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        metadata JSONB NOT NULL,
        embedding vector(1536) NOT NULL
      );
      TRUNCATE TABLE documents RESTART IDENTITY;
    `);

    for (const source of SOURCES) {
      log(`\nProcessing: ${source.title}`);
      const text = await fetchAndExtractText(source);
      const chunks = chunkText(text, CHUNK_SIZE, CHUNK_OVERLAP);
      log(`  [OK] Extracted ${text.length} chars -> ${chunks.length} chunks`);

      log(`  Generating embeddings via OpenAI...`);
      const { embeddings } = await embedMany({
        model: openai.embedding('text-embedding-3-small'),
        values: chunks,
      });
      log(`  [OK] Generated ${embeddings.length} embeddings`);

      log(`  Storing in Postgres pgvector...`);
      for (let i = 0; i < chunks.length; i++) {
        const embeddingStr = `[${embeddings[i].join(',')}]`;
        await client.query(
          `INSERT INTO documents (content, metadata, embedding) VALUES ($1, $2, $3)`,
          [
            chunks[i],
            JSON.stringify({ source: source.url, title: source.title, chunk: i }),
            embeddingStr,
          ]
        );
      }
      log(`  [OK] Stored ${chunks.length} document chunks`);
    }

    log('\n[DONE] Ingestion complete! Database is ready for RAG queries.');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('[ERROR] Ingestion failed:', err);
  process.exit(1);
});
