import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { conversations } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest) {
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

  await db
    .update(conversations)
    .set({ rating, adminComment: comment ?? null })
    .where(eq(conversations.id, conversationId));

  return NextResponse.json({ success: true });
}
