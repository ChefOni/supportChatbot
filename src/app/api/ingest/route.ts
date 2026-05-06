import { NextRequest, NextResponse } from "next/server";
import { withTenantContext } from "@/lib/db";
import { upsertEmbeddings } from "@/lib/qdrant";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { tenantId, documentId, content, chunks } = await req.json();

    if (!tenantId || !documentId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate embeddings for chunks
    const chunksToProcess = chunks || splitContentIntoChunks(content, 500, 50);
    const points = [];

    for (let i = 0; i < chunksToProcess.length; i++) {
      const chunk = chunksToProcess[i];
      
      // Generate embedding
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: chunk,
      });

      const embedding = embeddingResponse.data[0].embedding;

      points.push({
        id: `${documentId}_chunk_${i}`,
        vector: embedding,
        payload: {
          content: chunk,
          document_id: documentId,
          chunk_index: i,
          tenant_id: tenantId,
        },
      });
    }

    // Upsert to Qdrant
    await upsertEmbeddings(tenantId, points);

    // Update document status
    await withTenantContext(tenantId, async (client) => {
      await client.query(
        "UPDATE documents SET ingestion_status = 'completed', chunk_count = $1, updated_at = NOW() WHERE id = $2",
        [points.length, documentId]
      );
    });

    return NextResponse.json({ success: true, chunksProcessed: points.length });
  } catch (error) {
    console.error("Ingestion error:", error);
    
    // Update document status to failed
    if (req.body) {
      const body = await req.json();
      if (body.tenantId && body.documentId) {
        await withTenantContext(body.tenantId, async (client) => {
          await client.query(
            "UPDATE documents SET ingestion_status = 'failed', ingestion_error = $1, updated_at = NOW() WHERE id = $2",
            [error instanceof Error ? error.message : "Unknown error", body.documentId]
          );
        });
      }
    }

    return NextResponse.json({ error: "Ingestion failed" }, { status: 500 });
  }
}

// Helper to split content into overlapping chunks
function splitContentIntoChunks(
  content: string,
  chunkSize: number = 500,
  overlap: number = 50
): string[] {
  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < content.length) {
    const endIndex = Math.min(startIndex + chunkSize, content.length);
    chunks.push(content.substring(startIndex, endIndex));
    startIndex += chunkSize - overlap;
  }

  return chunks;
}
