import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { withTenantContext } from "@/lib/db";
import { createDocument, getDocuments, updateDocumentStatus } from "@/services/documentService";
import { createReadStream } from "fs";
import { pipeline } from "stream/promises";
import { createWriteStream } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { writeFile } from "fs/promises";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Get tenant ID from Clerk user
    const tenantId = await getTenantIdFromClerkUserId(userId);
    if (!tenantId) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Save file temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempPath = join(tmpdir(), `upload_${Date.now()}_${file.name}`);
    await writeFile(tempPath, buffer);

    // Create document record
    const document = await createDocument(
      tenantId,
      userId,
      file.name,
      file.size,
      file.type
    );

    // Update status to processing
    await updateDocumentStatus(tenantId, document.id, "processing");

    // Trigger background ingestion (BullMQ job)
    await addIngestionJob({
      tenantId,
      documentId: document.id,
      filePath: tempPath,
      mimeType: file.type,
    });

    return NextResponse.json({ success: true, document });
  } catch (error) {
    console.error("Document upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tenantId = await getTenantIdFromClerkUserId(userId);
    if (!tenantId) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const documents = await getDocuments(tenantId);
    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Get documents error:", error);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}

async function getTenantIdFromClerkUserId(clerkUserId: string): Promise<string | null> {
  return await withTenantContext<string | null>("00000000-0000-0000-0000-000000000000", async (client) => {
    const result = await client.query(
      "SELECT tenant_id FROM users WHERE clerk_user_id = $1",
      [clerkUserId]
    );
    return result.rows[0]?.tenant_id || null;
  });
}

async function addIngestionJob(data: { tenantId: string; documentId: string; filePath: string; mimeType: string }) {
  // TODO: Implement BullMQ job
  // For now, process directly
  try {
    const { processDocument } = await import("@/services/ingestionService");
    await processDocument(data.tenantId, data.documentId, data.filePath, data.mimeType);
  } catch (error) {
    console.error("Ingestion failed:", error);
    await updateDocumentStatus(data.tenantId, data.documentId, "failed", undefined, error instanceof Error ? error.message : "Unknown error");
  }
}
