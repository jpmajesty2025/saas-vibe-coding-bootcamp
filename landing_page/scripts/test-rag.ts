/**
 * Headless integration test for the RAG pipeline.
 * Run with: npm run test:rag
 * Tests: DB connection, embedding generation, and context retrieval.
 */
// env loading handled by src/lib/db/client.ts
import pool from '../src/lib/db/client';
import { createOpenAI } from '@ai-sdk/openai';
import { embed } from 'ai';

const log = (...args: Parameters<typeof console.log>) => console.error(...args);

const TEST_QUERIES = [
  'What are the symptoms of measles?',
  'What is the isolation period for measles exposure?',
  'What is the MMR vaccine schedule for children?',
];

async function testDatabaseConnection() {
  log('1. Testing database connection...');
  const result = await pool.query('SELECT NOW() as time');
  log(`   [OK] Connected! DB time: ${result.rows[0].time}\n`);
}

async function testDocumentCount() {
  log('2. Checking document count in vector store...');
  const result = await pool.query('SELECT COUNT(*) as count FROM documents');
  const count = parseInt(result.rows[0].count);
  if (count === 0) throw new Error('No documents found! Run: npm run ingest first.');
  log(`   [OK] Found ${count} document chunks in the vector store.\n`);
}

async function testRetrievalForQuery(openai: ReturnType<typeof createOpenAI>, query: string) {
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: query,
  });

  const embeddingStr = `[${embedding.join(',')}]`;
  const result = await pool.query(
    `SELECT content, metadata, 1 - (embedding <=> $1::vector) AS similarity
     FROM documents WHERE 1 - (embedding <=> $1::vector) > 0.4
     ORDER BY embedding <=> $1::vector LIMIT 3`,
    [embeddingStr]
  );

  log(`   Query: "${query}"`);
  if (result.rows.length === 0) {
    log(`   [WARN] No relevant documents found above threshold.\n`);
  } else {
    log(`   [OK] Top result (similarity: ${parseFloat(result.rows[0].similarity).toFixed(3)}):`);
    log(`        Source: ${result.rows[0].metadata.title}`);
    log(`        Preview: ${result.rows[0].content.substring(0, 150)}...\n`);
  }
}

async function testRetrieval(openai: ReturnType<typeof createOpenAI>) {
  log('3. Testing semantic retrieval for sample queries...');
  for (const query of TEST_QUERIES) {
    await testRetrievalForQuery(openai, query);
  }
}

async function main() {
  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

  log('VitalDocs AI - Headless RAG Integration Test\n');
  log('='.repeat(50) + '\n');
  try {
    await testDatabaseConnection();
    await testDocumentCount();
    await testRetrieval(openai);
    log('='.repeat(50));
    log('[PASS] All tests passed! The RAG backend is ready.\n');
  } catch (error) {
    console.error('[FAIL] Test failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
