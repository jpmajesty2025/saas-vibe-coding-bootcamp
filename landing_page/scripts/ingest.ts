import 'dotenv/config';
// pdf-parse v2 ESM has no default export; require() is reliable in Node.js scripts
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (data: Buffer) => Promise<{ text: string }>;
import pool from '../src/lib/db/client';
import { openai } from '@ai-sdk/openai';
import { embedMany } from 'ai';

const SOURCES = [
  {
    title: 'CDC Pink Book: Measles, Mumps, and Rubella Vaccines (2024)',
    url: 'https://www2.cdc.gov/vaccines/ed/pinkbook/2024/pb9/PB_MMR.pdf',
    type: 'pdf' as const,
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
  console.log(`  Fetching: ${source.url}`);
  const response = await fetch(source.url);
  if (!response.ok) throw new Error(`Failed to fetch ${source.url}: ${response.statusText}`);

  if (source.type === 'pdf') {
    const arrayBuffer = await response.arrayBuffer();
    const data = await pdfParse(Buffer.from(arrayBuffer));
    return data.text;
  } else {
    const html = await response.text();
    const cheerio = await import('cheerio');
    const $ = cheerio.load(html);
    $('nav, footer, header, script, style, .nav, .footer, .header').remove();
    return $('main, article, .content, body').text().replace(/\s+/g, ' ').trim();
  }
}

async function main() {
  console.log('🚀 Starting RAG ingestion pipeline...\n');

  const client = await pool.connect();
  try {
    console.log('📦 Ensuring documents table exists...');
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS vector;
      CREATE TABLE IF NOT EXISTS documents (
        id BIGSERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        metadata JSONB NOT NULL,
        embedding vector(1536) NOT NULL
      );
    `);

    for (const source of SOURCES) {
      console.log(`\n📄 Processing: ${source.title}`);
      const text = await fetchAndExtractText(source);
      const chunks = chunkText(text, CHUNK_SIZE, CHUNK_OVERLAP);
      console.log(`  ✓ Extracted ${text.length} chars → ${chunks.length} chunks`);

      console.log(`  🔢 Generating embeddings via OpenAI...`);
      const { embeddings } = await embedMany({
        model: openai.embedding('text-embedding-3-small'),
        values: chunks,
      });
      console.log(`  ✓ Generated ${embeddings.length} embeddings`);

      console.log(`  💾 Storing in Postgres pgvector...`);
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
      console.log(`  ✓ Stored ${chunks.length} document chunks`);
    }

    console.log('\n✅ Ingestion complete! Database is ready for RAG queries.');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('❌ Ingestion failed:', err);
  process.exit(1);
});
