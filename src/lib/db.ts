import { Pool, PoolClient } from 'pg';

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Helper to set tenant context for RLS
export async function setTenantContext(client: PoolClient, tenantId: string): Promise<void> {
  await client.query(`SELECT set_tenant_context($1)`, [tenantId]);
}

// Helper to run queries with tenant context
export async function withTenantContext<T>(
  tenantId: string,
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await setTenantContext(client, tenantId);
    return await callback(client);
  } finally {
    client.release();
  }
}

// Get a regular client (for queries without tenant context, e.g., auth)
export async function getClient(): Promise<PoolClient> {
  return await pool.connect();
}

export default pool;
