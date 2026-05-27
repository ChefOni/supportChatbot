import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { feedback } from "@/db/schema";
import { eq } from "drizzle-orm";
import { conversations } from "@/db/schema";

export async function POST(req: NextRequest) {
  const { conversationId, rating, comment } = await req.json();

  if (!conversationId || !rating) {
    return NextResponse.json(
      { error: "conversationId and rating are required" },
      { status: 400 }
    );
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "rating must be between 1 and 5" },
      { status: 400 }
    );
  }

  const conversation = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .then((r) => r[0]);

  if (!conversation) {
    return NextResponse.json(
      { error: "conversation not found" },
      { status: 404 }
    );
  }

  await db.insert(feedback).values({
    conversationId,
    rating,
    comment: comment ?? null,
  });

  return NextResponse.json({ success: true });
}
