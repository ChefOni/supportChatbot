import { NextResponse } from "next/server";
import { db } from "@/db";
import { kbDocuments } from "@/db/schema";
import { embed } from "@/lib/embed";
import { eq } from "drizzle-orm";

export async function POST() {
  try {
    const docs = await db.select().from(kbDocuments);

    for (const doc of docs) {
      const vector = await embed(`${doc.title}\n${doc.content}`);
      await db
        .update(kbDocuments)
        .set({ embedding: JSON.stringify(vector) })
        .where(eq(kbDocuments.id, doc.id));
    }

    return NextResponse.json({
      success: true,
      embedded: docs.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Embedding failed", details: String(error) },
      { status: 500 }
    );
  }
}
