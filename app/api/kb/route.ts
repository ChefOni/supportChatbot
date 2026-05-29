import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { kbDocuments } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const docs = await db
      .select()
      .from(kbDocuments)
      .orderBy(sql`created_at desc`);
    return NextResponse.json(docs);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, content, tags } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "title and content are required" },
        { status: 400 }
      );
    }

    const [doc] = await db
      .insert(kbDocuments)
      .values({ title, content, tags: tags ?? [] })
      .returning();

    return NextResponse.json(doc, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}
