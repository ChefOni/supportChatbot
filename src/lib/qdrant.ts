import { QdrantClient } from '@qdrant/js-client-rest';

// Initialize Qdrant client
const qdrantUrl = process.env.QDRANT_URL || 'http://localhost:6333';
export const qdrantClient = new QdrantClient({ url: qdrantUrl });

// Helper to get per-tenant collection name
export function getTenantCollectionName(tenantId: string): string {
  return `tenant_${tenantId.replace(/-/g, '_')}_embeddings`;
}

// Initialize a collection for a tenant
export async function initializeTenantCollection(tenantId: string): Promise<void> {
  const collectionName = getTenantCollectionName(tenantId);
  
  try {
    // Check if collection exists
    await qdrantClient.getCollection(collectionName);
  } catch (error) {
    // Collection doesn't exist, create it
    await qdrantClient.createCollection(collectionName, {
      vectors: {
        size: 1536, // OpenAI text-embedding-3-small dimensions
        distance: 'Cosine',
      },
    });
    
    // Create payload index for tenant isolation (extra safety)
    await qdrantClient.createPayloadIndex(collectionName, {
      field_name: 'tenant_id',
      field_schema: 'keyword',
    });
  }
}

// Upsert embeddings to tenant's collection
export async function upsertEmbeddings(
  tenantId: string,
  points: Array<{
    id: string;
    vector: number[];
    payload: Record<string, any>;
  }>
): Promise<void> {
  const collectionName = getTenantCollectionName(tenantId);
  await qdrantClient.upsert(collectionName, {
    wait: true,
    points: points.map(p => ({
      id: p.id,
      vector: p.vector,
      payload: { ...p.payload, tenant_id: tenantId },
    })),
  });
}

// Search embeddings in tenant's collection
export async function searchEmbeddings(
  tenantId: string,
  queryVector: number[],
  limit: number = 5,
  scoreThreshold?: number
): Promise<Array<{ id: string; score: number; payload: Record<string, any> }>> {
  const collectionName = getTenantCollectionName(tenantId);
  
  const searchResult = await qdrantClient.search(collectionName, {
    vector: queryVector,
    limit,
    score_threshold: scoreThreshold,
    with_payload: true,
    // Extra safety: filter by tenant_id even though collections are separate
    filter: {
      must: [
        {
          key: 'tenant_id',
          match: { value: tenantId },
        },
      ],
    },
  });
  
  return searchResult.map(hit => ({
    id: hit.id as string,
    score: hit.score || 0,
    payload: hit.payload as Record<string, any>,
  }));
}
