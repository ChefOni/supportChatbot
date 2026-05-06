import { createHash, randomBytes } from 'crypto';
import pool from '@/lib/db';
import { withTenantContext } from '@/lib/db';

export interface ApiKey {
  id: string;
  tenant_id: string;
  name: string;
  key_hash: string;
  key_prefix: string;
  last_used_at: Date | null;
  expires_at: Date | null;
  is_active: boolean;
  created_at: Date;
}

export async function createApiKey(
  tenantId: string,
  userId: string | null,
  name: string,
  expiresInDays?: number
): Promise<{ apiKey: string; record: ApiKey }> {
  // Generate API key: sc_ + 32 random bytes in hex
  const apiKey = `sc_${randomBytes(32).toString('hex')}`;
  const keyHash = createHash('sha256').update(apiKey).digest('hex');
  const keyPrefix = apiKey.substring(0, 12); // sc_abc123...

  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  return await withTenantContext<{ apiKey: string; record: ApiKey }>(
    tenantId,
    async (client) => {
      const result = await client.query(
        `INSERT INTO api_keys (tenant_id, user_id, name, key_hash, key_prefix, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [tenantId, userId, name, keyHash, keyPrefix, expiresAt]
      );

      return { apiKey, record: result.rows[0] };
    }
  );
}

export async function getApiKeys(tenantId: string): Promise<ApiKey[]> {
  return await withTenantContext<ApiKey[]>(tenantId, async (client) => {
    const result = await client.query(
      'SELECT id, tenant_id, name, key_prefix, last_used_at, expires_at, is_active, created_at FROM api_keys WHERE is_active = TRUE ORDER BY created_at DESC'
    );
    return result.rows;
  });
}

export async function revokeApiKey(
  tenantId: string,
  keyId: string
): Promise<void> {
  await withTenantContext(tenantId, async (client) => {
    await client.query(
      'UPDATE api_keys SET is_active = FALSE WHERE id = $1',
      [keyId]
    );
  });
}

export async function validateApiKey(
  apiKey: string
): Promise<{ tenantId: string; keyId: string } | null> {
  const keyHash = createHash('sha256').update(apiKey).digest('hex');

  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT id, tenant_id FROM api_keys 
       WHERE key_hash = $1 AND is_active = TRUE 
       AND (expires_at IS NULL OR expires_at > NOW())`,
      [keyHash]
    );

    if (result.rows.length === 0) return null;

    const key = result.rows[0];
    // Update last_used_at
    await client.query(
      'UPDATE api_keys SET last_used_at = NOW() WHERE id = $1',
      [key.id]
    );

    return { tenantId: key.tenant_id, keyId: key.id };
  } finally {
    client.release();
  }
}
