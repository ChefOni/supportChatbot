import { withTenantContext } from "@/lib/db";

export interface TenantSettings {
  id: string;
  tenant_id: string;
  chatbot_name: string;
  greeting_text: string;
  placeholder_text: string;
  primary_color: string;
  logo_url: string | null;
  is_deployed: boolean;
  deployed_at: Date | null;
  custom_css: string | null;
  created_at: Date;
  updated_at: Date;
}

export async function getTenantSettings(tenantId: string): Promise<TenantSettings | null> {
  return await withTenantContext<TenantSettings | null>(tenantId, async (client) => {
    const result = await client.query(
      "SELECT * FROM tenant_settings WHERE tenant_id = $1",
      [tenantId]
    );
    return result.rows[0] || null;
  });
}

export async function updateTenantSettings(
  tenantId: string,
  updates: Partial<Omit<TenantSettings, "id" | "tenant_id" | "created_at" | "updated_at">>
): Promise<TenantSettings> {
  const setClause = Object.keys(updates)
    .map((key, i) => `${snakeCase(key)} = $${i + 1}`)
    .join(", ");

  const values = Object.values(updates);

  return await withTenantContext<TenantSettings>(tenantId, async (client) => {
    const result = await client.query(
      `UPDATE tenant_settings 
       SET ${setClause}, updated_at = NOW()
       WHERE tenant_id = $${values.length + 1}
       RETURNING *`,
      [...values, tenantId]
    );
    
    if (result.rows.length === 0) {
      // Create if not exists
      const insertResult = await client.query(
        `INSERT INTO tenant_settings (tenant_id)
         VALUES ($1)
         RETURNING *`,
        [tenantId]
      );
      return insertResult.rows[0];
    }
    
    return result.rows[0];
  });
}

export async function toggleDeployment(tenantId: string, deploy: boolean): Promise<TenantSettings> {
  return await withTenantContext<TenantSettings>(tenantId, async (client) => {
    const result = await client.query(
      `UPDATE tenant_settings 
       SET is_deployed = $1, deployed_at = $2, updated_at = NOW()
       WHERE tenant_id = $3
       RETURNING *`,
      [deploy, deploy ? new Date() : null, tenantId]
    );
    
    if (result.rows.length === 0) {
      const insertResult = await client.query(
        `INSERT INTO tenant_settings (tenant_id, is_deployed, deployed_at)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [tenantId, deploy, deploy ? new Date() : null]
      );
      return insertResult.rows[0];
    }
    
    return result.rows[0];
  });
}

// Helper to convert camelCase to snake_case
function snakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}
