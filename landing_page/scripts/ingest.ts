// env loading is handled by src/lib/db/client.ts
import pool from '../src/lib/db/client';
import { createOpenAI } from '@ai-sdk/openai';
import { embedMany } from 'ai';

// openai provider is created lazily inside main() after dotenv loads

const SOURCES = [
  // --- MMR: Measles, Mumps, Rubella ---
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
  {
    title: 'CDC Measles Vaccination Guidance',
    url: 'https://www.cdc.gov/measles/hcp/vaccine-considerations/index.html',
    type: 'html' as const,
  },
  {
    title: 'CDC Mumps Clinical Overview',
    url: 'https://www.cdc.gov/mumps/hcp/clinical-overview/index.html',
    type: 'html' as const,
  },
  {
    title: 'CDC Rubella Clinical Overview',
    url: 'https://www.cdc.gov/rubella/hcp/clinical-overview/index.html',
    type: 'html' as const,
  },
  // --- Pertussis (Whooping Cough) ---
  {
    title: 'CDC Pink Book Chapter 16: Pertussis',
    url: 'https://www.cdc.gov/pinkbook/hcp/table-of-contents/chapter-16-pertussis.html',
    type: 'html' as const,
  },
  {
    title: 'CDC Pertussis Clinical Overview',
    url: 'https://www.cdc.gov/pertussis/hcp/clinical-overview/index.html',
    type: 'html' as const,
  },
  {
    title: 'CDC Pertussis Vaccination Guidance',
    url: 'https://www.cdc.gov/pertussis/vaccines/index.html',
    type: 'html' as const,
  },
  // --- Influenza ---
  {
    title: 'CDC Influenza Signs and Symptoms',
    url: 'https://www.cdc.gov/flu/signs-symptoms/index.html',
    type: 'html' as const,
  },
  {
    title: 'CDC Influenza Clinical Signs for HCP',
    url: 'https://www.cdc.gov/flu/hcp/clinical-signs/index.html',
    type: 'html' as const,
  },
  {
    title: 'CDC Influenza Antiviral Medications Summary for Clinicians',
    url: 'https://www.cdc.gov/flu/hcp/antivirals/summary-clinicians.html',
    type: 'html' as const,
  },
  {
    title: 'CDC Influenza Antiviral Medications Overview',
    url: 'https://www.cdc.gov/flu/hcp/antivirals/index.html',
    type: 'html' as const,
  },
  {
    title: 'CDC Influenza Testing Guidance for Clinicians',
    url: 'https://www.cdc.gov/flu/hcp/testing-methods/index.html',
    type: 'html' as const,
  },
  {
    title: 'CDC Influenza Testing Guidance for Clinicians (Outpatient)',
    url: 'https://www.cdc.gov/flu/hcp/clinical-guidance/testing-guidance-for-clinicians.html',
    type: 'html' as const,
  },
  {
    title: 'CDC Influenza Vaccine Recommendations for HCP',
    url: 'https://www.cdc.gov/flu/hcp/vax-summary/flu-vaccine-recommendation.html',
    type: 'html' as const,
  },
  {
    title: 'CDC Influenza ACIP Vaccine Recommendations',
    url: 'https://www.cdc.gov/flu/hcp/acip/index.html',
    type: 'html' as const,
  },
  {
    title: 'CDC Influenza Infection Control in Healthcare Settings',
    url: 'https://www.cdc.gov/flu/hcp/infection-control/healthcare-settings.html',
    type: 'html' as const,
  },
  {
    title: 'CDC Influenza Clinical Guidance Overview for HCP',
    url: 'https://www.cdc.gov/flu/hcp/clinical-guidance/index.html',
    type: 'html' as const,
  },
  // --- COVID-19 ---
  {
    title: 'CDC COVID-19 Clinical Care Overview',
    url: 'https://www.cdc.gov/covid/hcp/clinical-care/index.html',
    type: 'html' as const,
  },
  {
    title: 'CDC COVID-19 Overview and Infection Prevention',
    url: 'https://www.cdc.gov/covid/prevention/index.html',
    type: 'html' as const,
  },
  // --- Immunization Schedules ---
  {
    title: 'CDC Child and Adolescent Immunization Schedule 2025',
    url: 'https://www.cdc.gov/vaccines/hcp/imz-schedules/child-adolescent.html',
    type: 'html' as const,
  },
  {
    title: 'CDC Adult Immunization Schedule 2025',
    url: 'https://www.cdc.gov/vaccines/hcp/imz-schedules/adult.html',
    type: 'html' as const,
  },
  // --- Current Outbreak Data 2025-2026 ---
  {
    title: 'CDC Measles Cases and Outbreaks 2025',
    url: 'https://www.cdc.gov/measles/data-research/index.html',
    type: 'html' as const,
  },
  {
    title: 'CDC FluView Weekly Influenza Surveillance',
    url: 'https://www.cdc.gov/fluview/index.html',
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

/**
 * Returns true if the chunk is readable English text.
 * Rejects chunks where more than 5% of characters are non-ASCII,
 * or where the chunk has fewer than 5 whitespace-separated words.
 */
function isReadableText(chunk: string): boolean {
  const nonAscii = chunk.split('').filter((c) => c.charCodeAt(0) > 127).length;
  if (nonAscii / chunk.length > 0.05) return false;
  const wordCount = chunk.trim().split(/\s+/).length;
  if (wordCount < 5) return false;
  return true;
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

    let totalChunks = 0;
    let skipped = 0;
    for (const source of SOURCES) {
      log(`\nProcessing: ${source.title}`);
      try {
        const text = await fetchAndExtractText(source);
        const rawChunks = chunkText(text, CHUNK_SIZE, CHUNK_OVERLAP);
        const chunks = rawChunks.filter(isReadableText);
        const filtered = rawChunks.length - chunks.length;
        if (filtered > 0) log(`  [WARN] Dropped ${filtered} junk chunk(s) (non-ASCII or too short)`);
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
        totalChunks += chunks.length;
      } catch (err) {
        log(`  [SKIP] Failed to process source: ${(err as Error).message}`);
        skipped++;
      }
    }
    log(`\n[SUMMARY] Processed ${SOURCES.length - skipped}/${SOURCES.length} sources, ${totalChunks} total chunks (${skipped} skipped).`);

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
