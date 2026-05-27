import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { conversations } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest) {
  const { conversationId, status } = await req.json();

  if (!conversationId || !["active", "resolved", "escalated"].includes(status)) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }

  await db
    .update(conversations)
    .set({ status, updatedAt: new Date() })
    .where(eq(conversations.id, conversationId));

  return NextResponse.json({ success: true });
}
