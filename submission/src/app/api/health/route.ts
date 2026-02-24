import pool from '@/lib/db/client';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const result = await pool.query<{ count: string }>(
      'SELECT COUNT(*)::text AS count FROM documents'
    );
    const chunkCount = parseInt(result.rows[0]?.count ?? '0', 10);
    return Response.json({
      status: 'ok',
      db: 'connected',
      chunks: chunkCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      { status: 'error', db: 'unreachable', message: String(error) },
      { status: 503 }
    );
  }
}
