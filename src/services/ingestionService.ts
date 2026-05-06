import { readFileSync } from "fs";
import OpenAI from "openai";
import { updateDocumentStatus } from "./documentService";
import { upsertEmbeddings } from "@/lib/qdrant";
import { splitContentIntoChunks } from "@/lib/chunking";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function processDocument(
  tenantId: string,
  documentId: string,
  filePath: string,
  mimeType: string
): Promise<void> {
  try {
    // Read file content
    const content = readFileSync(filePath, "utf-8");

    // Split into chunks
    const chunks = splitContentIntoChunks(content, 500, 50);

    // Generate embeddings for each chunk
    const points = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

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
          mime_type: mimeType,
        },
      });
    }

    // Upsert to Qdrant
    await upsertEmbeddings(tenantId, points);

    // Update document status
    await updateDocumentStatus(tenantId, documentId, "completed", chunks.length);
  } catch (error) {
    console.error("Document processing error:", error);
    await updateDocumentStatus(
      tenantId,
      documentId,
      "failed",
      undefined,
      error instanceof Error ? error.message : "Unknown error"
    );
    throw error;
  }
}
