import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { attachDatabasePool } from '@vercel/functions';
let database: ReturnType<typeof drizzle> | undefined;
export function getDb() {
  if (!database) {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_NOT_CONFIGURED');
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 5, connectionTimeoutMillis: 10000, idleTimeoutMillis: 5000 });
    pool.on('error', () => console.error('Database pool connection error'));
    if (process.env.VERCEL) attachDatabasePool(pool);
    database = drizzle(pool);
  }
  return database;
}
