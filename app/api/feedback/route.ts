import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { feedback } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { category, message } = await req.json();

  if (!category || !message) {
    return NextResponse.json(
      { error: "category and message are required" },
      { status: 400 }
    );
  }

  if (!["bug", "suggestion", "other"].includes(category)) {
    return NextResponse.json(
      { error: "category must be bug, suggestion, or other" },
      { status: 400 }
    );
  }

  await db.insert(feedback).values({ category, message });

  return NextResponse.json({ success: true });
}

export async function GET() {
  const all = await db
    .select()
    .from(feedback)
    .orderBy(sql`created_at desc`);
  return NextResponse.json(all);
}
