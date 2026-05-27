import Link from "next/link";
import { db } from "@/db";
import { conversations, feedback } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function ConversationsPage() {
  let convs: typeof conversations.$inferSelect[] = [];
  let feedbackMap = new Map<number, typeof feedback.$inferSelect>();

  try {
    convs = await db
      .select()
      .from(conversations)
      .orderBy(sql`created_at desc`);

    feedbackMap = new Map(
      await db
        .select()
        .from(feedback)
        .then((rows) => rows.map((f) => [f.conversationId, f]))
    );
  } catch {
    // DB not available, show empty state
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Conversations
      </h1>

      <div className="mt-6 flex flex-col">
        <div className="grid grid-cols-[1fr_100px_100px_120px] gap-4 border-b border-foreground/10 px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted">
          <span>Customer</span>
          <span>Status</span>
          <span>Messages</span>
          <span>Date</span>
        </div>

        {convs.map((conv) => {
          const msgCount = (conv.messages as unknown as Array<unknown>).length;
          const fb = feedbackMap.get(conv.id);

          return (
            <Link
              key={conv.id}
              href={`/dashboard/conversations/${conv.id}`}
              className="grid grid-cols-[1fr_100px_100px_120px] gap-4 border-b border-foreground/10 px-4 py-3 text-sm transition-colors hover:bg-surface-elevated"
            >
              <div className="flex items-center gap-3">
                <span className="font-medium">{conv.customerId}</span>
                {fb && (
                  <span className="text-xs text-accent">{fb.rating}★</span>
                )}
              </div>
              <span
                className={`text-xs font-medium ${
                  conv.status === "active"
                    ? "text-green-600"
                    : conv.status === "escalated"
                      ? "text-red-500"
                      : "text-muted"
                }`}
              >
                {conv.status}
              </span>
              <span className="text-muted">{msgCount}</span>
              <span className="text-muted">
                {new Date(conv.createdAt).toLocaleDateString()}
              </span>
            </Link>
          );
        })}

        {convs.length === 0 && (
          <p className="py-12 text-center text-sm text-muted">
            No conversations yet. Try the demo widget at /demo.
          </p>
        )}
      </div>
    </div>
  );
}
