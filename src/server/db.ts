import { Pool, PoolClient } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/** Existing withTenant... (keep your current version) */

/** Admin connection helper, no host or tenant lookup required */
export async function withAdmin<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    // optional, mark the role in-session for any RLS that checks it
    await client.query(`select set_config('app.role', 'admin', false)`);
    return await fn(client);
  } finally {
    client.release();
  }
}
