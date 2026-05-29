import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { conversations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AdminRating } from "./admin-rating";
import type { Message } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const convId = Number(id);

  let conv: typeof conversations.$inferSelect | null = null;

  try {
    conv = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, convId))
      .then((r) => r[0] ?? null);
  } catch {
  }

  if (!conv) notFound();

  const messages = conv.messages as unknown as Message[];

  return (
    <div>
      <Link
        href="/dashboard/conversations"
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        &larr; Back to conversations
      </Link>

      <div className="mt-6 flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {conv.customerId}
          </h1>
          <p className="mt-2 text-sm text-muted">
            Started {new Date(conv.createdAt).toLocaleString()}
            &nbsp;&middot;&nbsp;
            <span
              className={
                conv.status === "active"
                  ? "text-green-600"
                  : conv.status === "escalated"
                    ? "text-red-500"
                    : "text-muted"
              }
            >
              {conv.status}
            </span>
          </p>
        </div>

        <AdminRating conversationId={conv.id} currentRating={conv.rating} currentComment={conv.adminComment} />
      </div>

      <div className="mt-10 flex flex-col gap-6">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-brand text-white"
                  : "border border-foreground/10 bg-background"
              }`}
            >
              <p>{msg.content}</p>
              <p className="mt-1 text-xs opacity-50">
                {new Date(msg.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
