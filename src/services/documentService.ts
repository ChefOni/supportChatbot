import pool from '@/lib/db';
import { withTenantContext } from '@/lib/db';
import { initializeTenantCollection, getTenantCollectionName } from '@/lib/qdrant';

export interface Document {
  id: string;
  tenant_id: string;
  filename: string;
  file_size: number | null;
  mime_type: string | null;
  ingestion_status: string;
  chunk_count: number;
  created_at: Date;
}

export async function createDocument(
  tenantId: string,
  userId: string | null,
  filename: string,
  fileSize: number,
  mimeType: string
): Promise<Document> {
  // Initialize Qdrant collection for tenant if not exists
  await initializeTenantCollection(tenantId);

  return await withTenantContext<Document>(tenantId, async (client) => {
    const result = await client.query(
      `INSERT INTO documents (tenant_id, user_id, filename, file_size, mime_type, qdrant_collection_name)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [tenantId, userId, filename, fileSize, mimeType, getTenantCollectionName(tenantId)]
    );
    return result.rows[0];
  });
}

export async function getDocuments(tenantId: string): Promise<Document[]> {
  return await withTenantContext<Document[]>(tenantId, async (client) => {
    const result = await client.query(
      'SELECT * FROM documents ORDER BY created_at DESC'
    );
    return result.rows;
  });
}

export async function updateDocumentStatus(
  tenantId: string,
  documentId: string,
  status: string,
  chunkCount?: number,
  error?: string
): Promise<void> {
  await withTenantContext(tenantId, async (client) => {
    await client.query(
      `UPDATE documents 
       SET ingestion_status = $1, chunk_count = $2, ingestion_error = $3, updated_at = NOW()
       WHERE id = $4`,
      [status, chunkCount || null, error || null, documentId]
    );
  });
}

export async function deleteDocument(
  tenantId: string,
  documentId: string
): Promise<void> {
  await withTenantContext(tenantId, async (client) => {
    await client.query('DELETE FROM documents WHERE id = $1', [documentId]);
  });
}
