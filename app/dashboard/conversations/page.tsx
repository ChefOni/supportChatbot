import Link from "next/link";
import { db } from "@/db";
import { conversations } from "@/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function ConversationsPage() {
  let convs: typeof conversations.$inferSelect[] = [];

  try {
    convs = await db
      .select()
      .from(conversations)
      .orderBy(sql`created_at desc`);
  } catch {
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Conversations
      </h1>

      <div className="mt-6 flex flex-col">
        <div className="grid grid-cols-[1fr_80px_100px_100px_120px] gap-4 border-b border-foreground/10 px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted">
          <span>Customer</span>
          <span>Rating</span>
          <span>Status</span>
          <span>Messages</span>
          <span>Date</span>
        </div>

        {convs.map((conv) => {
          const msgCount = (conv.messages as unknown as Array<unknown>).length;

          return (
            <Link
              key={conv.id}
              href={`/dashboard/conversations/${conv.id}`}
              className="grid grid-cols-[1fr_80px_100px_100px_120px] gap-4 border-b border-foreground/10 px-4 py-3 text-sm transition-colors hover:bg-surface-elevated"
            >
              <span className="font-medium">{conv.customerId}</span>
              <span className={`text-xs font-medium ${conv.rating ? "text-accent" : "text-muted"}`}>
                {conv.rating ? `${conv.rating}★` : "—"}
              </span>
              <span
                className={`text-xs font-medium ${
                  conv.status === "active"
                    ? "text-green-600"
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
