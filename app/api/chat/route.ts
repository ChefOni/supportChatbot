import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { conversations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateResponse } from "@/lib/rag";
import type { Message } from "@/db/schema";

export async function POST(req: NextRequest) {
  const { message, conversationId } = await req.json();

  if (!message || typeof message !== "string") {
    return NextResponse.json(
      { error: "message is required" },
      { status: 400 }
    );
  }

  let conversation: typeof conversations.$inferSelect;
  const now = new Date().toISOString();

  if (conversationId) {
    const existing = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .then((r) => r[0]);

    if (!existing) {
      return NextResponse.json(
        { error: "conversation not found" },
        { status: 404 }
      );
    }
    conversation = existing;
  } else {
    const [created] = await db
      .insert(conversations)
      .values({
        customerId: crypto.randomUUID().slice(0, 8),
        messages: [],
        status: "active",
      })
      .returning();
    conversation = created;
  }

  const history = (conversation.messages as Message[]) ?? [];

  const userMessage: Message = {
    role: "user",
    content: message,
    created_at: now,
  };

  const reply = await generateResponse(message, history);
  const assistantMessage: Message = {
    role: "assistant",
    content: reply,
    created_at: new Date().toISOString(),
  };

  await db
    .update(conversations)
    .set({
      messages: [...history, userMessage, assistantMessage],
      updatedAt: new Date(),
    })
    .where(eq(conversations.id, conversation.id));

  return NextResponse.json({
    reply,
    conversationId: conversation.id,
  });
}
