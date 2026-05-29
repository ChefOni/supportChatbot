import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { kbDocuments } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  try {
    const patch: Partial<typeof kbDocuments.$inferInsert> = {};
    if (body.title) patch.title = body.title;
    if (body.content) patch.content = body.content;
    if (body.tags) patch.tags = body.tags;
    patch.embedding = null;

    await db
      .update(kbDocuments)
      .set(patch)
      .where(eq(kbDocuments.id, Number(id)));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await db
      .delete(kbDocuments)
      .where(eq(kbDocuments.id, Number(id)));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete" },
      { status: 500 }
    );
  }
}
