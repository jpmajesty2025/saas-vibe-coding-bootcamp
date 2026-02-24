import { config } from 'dotenv';
import { resolve } from 'path';

// Self-load env vars so this module works in both Next.js and standalone scripts
config({ path: resolve(process.cwd(), '.env.local'), quiet: true, override: true });
config({ path: resolve(process.cwd(), '.env'), quiet: true, override: true });

import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set.');
}

// Strip parameters that pg v8 does not support (channel_binding is a libpq-only feature)
const connectionString = process.env.DATABASE_URL
  .replace(/[&?]channel_binding=[^&]*/g, '')
  .replace(/\?&/, '?');

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  // Delay idle connection creation - prevents eager connect at module load
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  max: 5,
});

// Prevent unhandled errors from idle connections crashing the process
pool.on('error', (err) => {
  console.error('Unexpected pool client error (non-fatal):', err.message);
});

export default pool;
