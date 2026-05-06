import { withTenantContext } from "./db";

export async function getTenantIdFromClerkUserId(
  clerkUserId: string
): Promise<string | null> {
  return await withTenantContext<string | null>(
    "00000000-0000-0000-0000-000000000000",
    async (client) => {
      const result = await client.query(
        "SELECT tenant_id FROM users WHERE clerk_user_id = $1",
        [clerkUserId]
      );
      return result.rows[0]?.tenant_id || null;
    }
  );
}

export async function syncUserToDatabase(
  clerkUserId: string,
  email: string,
  name: string | null,
  tenantId: string
): Promise<void> {
  await withTenantContext(tenantId, async (client) => {
    await client.query(
      `INSERT INTO users (tenant_id, clerk_user_id, email, name)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (clerk_user_id)
       DO UPDATE SET email = $3, name = $4, updated_at = NOW()`,
      [tenantId, clerkUserId, email, name]
    );
  });
}
