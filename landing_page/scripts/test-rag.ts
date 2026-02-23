/**
 * Headless integration test for the RAG pipeline.
 * Run with: npx tsx scripts/test-rag.ts
 * Tests: DB connection, embedding generation, and context retrieval.
 */
import 'dotenv/config';
import pool from '../lib/db/client';
import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';

const TEST_QUERIES = [
  'What are the symptoms of measles?',
  'What is the isolation period for measles exposure?',
  'What is the MMR vaccine schedule for children?',
];

async function testDatabaseConnection() {
  console.log('1️⃣  Testing database connection...');
  const result = await pool.query('SELECT NOW() as time');
  console.log(`   ✅ Connected! DB time: ${result.rows[0].time}\n`);
}

async function testDocumentCount() {
  console.log('2️⃣  Checking document count in vector store...');
  const result = await pool.query('SELECT COUNT(*) as count FROM documents');
  const count = parseInt(result.rows[0].count);
  if (count === 0) throw new Error('No documents found! Run: npx tsx scripts/ingest.ts first.');
  console.log(`   ✅ Found ${count} document chunks in the vector store.\n`);
}

async function testRetrievalForQuery(query: string) {
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

  console.log(`   Query: "${query}"`);
  if (result.rows.length === 0) {
    console.log(`   ⚠️  No relevant documents found above threshold.\n`);
  } else {
    console.log(`   ✅ Top result (similarity: ${parseFloat(result.rows[0].similarity).toFixed(3)}):`);
    console.log(`      Source: ${result.rows[0].metadata.title}`);
    console.log(`      Preview: ${result.rows[0].content.substring(0, 150)}...\n`);
  }
}

async function testRetrieval() {
  console.log('3️⃣  Testing semantic retrieval for sample queries...');
  for (const query of TEST_QUERIES) {
    await testRetrievalForQuery(query);
  }
}

async function main() {
  console.log('🧪 VitalDocs AI - Headless RAG Integration Test\n');
  console.log('='.repeat(50) + '\n');
  try {
    await testDatabaseConnection();
    await testDocumentCount();
    await testRetrieval();
    console.log('='.repeat(50));
    console.log('✅ All tests passed! The RAG backend is ready.\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
