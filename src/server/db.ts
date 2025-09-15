// src/server/db.ts
import { Pool, PoolClient } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export type TenantCtx = { tenantId: string };

/**
 * Resolve tenant from the request host, set session vars for the connection,
 * and run your callback with both the pg client and the explicit tenantId.
 * We set is_local = false so the settings persist for the whole session.
 */
export async function withTenant<T>(
  host: string,
  fn: (client: PoolClient, ctx: TenantCtx) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    // find tenant by hostname
    const { rows } = await client.query<{ id: string }>(
      `select t.id
         from tenants t
         join domains d on d.tenant_id = t.id
        where lower(d.hostname) = lower($1)
        limit 1`,
      [host]
    );

    if (!rows.length) {
      throw new Error(`Unknown tenant for host "${host}"`);
    }

    const tenantId = rows[0].id;

    // set session context for RLS-friendly reads
    await client.query(
      `select
         set_config('app.tenant_id', $1, false),
         set_config('app.role', 'user', false)`,
      [tenantId]
    );

    // execute user work
    return await fn(client, { tenantId });
  } finally {
    client.release();
  }
}

/**
 * Admin helper for tasks that are not tenant scoped,
 * for example webhooks, migrations, maintenance.
 */
export async function withAdmin<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query(`select set_config('app.role', 'admin', false)`);
    return await fn(client);
  } finally {
    client.release();
  }
}
