import { createHash, randomBytes } from "crypto";
import { withTenantContext } from "@/lib/db";

export interface EmbedToken {
  id: string;
  tenant_id: string;
  token_hash: string;
  domain_restriction: string | null;
  expires_at: Date;
  last_used_at: Date | null;
  is_active: boolean;
  created_at: Date;
}

export async function createEmbedToken(
  tenantId: string,
  domainRestriction?: string,
  expiresInDays: number = 365
): Promise<{ token: string; record: EmbedToken }> {
  const token = `emb_${randomBytes(24).toString("hex")}`;
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

  return await withTenantContext<{ token: string; record: EmbedToken }>(
    tenantId,
    async (client) => {
      const result = await client.query(
        `INSERT INTO embed_tokens (tenant_id, token_hash, domain_restriction, expires_at)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [tenantId, tokenHash, domainRestriction || null, expiresAt]
      );
      return { token, record: result.rows[0] };
    }
  );
}

export async function getEmbedTokens(tenantId: string): Promise<EmbedToken[]> {
  return await withTenantContext<EmbedToken[]>(tenantId, async (client) => {
    const result = await client.query(
      "SELECT id, tenant_id, domain_restriction, expires_at, last_used_at, is_active, created_at FROM embed_tokens WHERE is_active = TRUE ORDER BY created_at DESC"
    );
    return result.rows;
  });
}

export async function revokeEmbedToken(tenantId: string, tokenId: string): Promise<void> {
  await withTenantContext(tenantId, async (client) => {
    await client.query(
      "UPDATE embed_tokens SET is_active = FALSE WHERE id = $1",
      [tokenId]
    );
  });
}

export async function validateEmbedToken(
  token: string
): Promise<{ tenantId: string; tokenId: string } | null> {
  const tokenHash = createHash("sha256").update(token).digest("hex");

  const client = await (await import("@/lib/db")).default.connect();
  try {
    const result = await client.query(
      `SELECT id, tenant_id FROM embed_tokens 
       WHERE token_hash = $1 AND is_active = TRUE AND expires_at > NOW()`,
      [tokenHash]
    );

    if (result.rows.length === 0) return null;

    const tokenRecord = result.rows[0];
    await client.query(
      "UPDATE embed_tokens SET last_used_at = NOW() WHERE id = $1",
      [tokenRecord.id]
    );

    return { tenantId: tokenRecord.tenant_id, tokenId: tokenRecord.id };
  } finally {
    client.release();
  }
}
