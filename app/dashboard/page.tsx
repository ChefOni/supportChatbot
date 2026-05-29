import { db } from "@/db";
import { conversations, feedback, kbDocuments } from "@/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function safeQuery<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const convCount =
    (await safeQuery(() =>
      db
        .select({ count: sql<number>`count(*)` })
        .from(conversations)
        .then((r) => Number(r[0].count))
    )) ?? 0;

  const statusCounts =
    (await safeQuery(() =>
      db
        .select({ status: conversations.status, count: sql<number>`count(*)` })
        .from(conversations)
        .groupBy(conversations.status)
    )) ?? [];

  const activeCount =
    statusCounts.find((s) => s.status === "active")?.count ?? 0;
  const resolvedCount =
    statusCounts.find((s) => s.status === "resolved")?.count ?? 0;

  const avgRating =
    (await safeQuery(() =>
      db
        .select({ avg: sql<number>`coalesce(avg(rating), 0)` })
        .from(feedback)
        .then((r) => Number(r[0].avg).toFixed(1))
    )) ?? "0.0";

  const feedbackCount =
    (await safeQuery(() =>
      db
        .select({ count: sql<number>`count(*)` })
        .from(feedback)
        .then((r) => Number(r[0].count))
    )) ?? 0;

  const kbCount =
    (await safeQuery(() =>
      db
        .select({ count: sql<number>`count(*)` })
        .from(kbDocuments)
        .then((r) => Number(r[0].count))
    )) ?? 0;

  const recentConvs =
    (await safeQuery(() =>
      db
        .select()
        .from(conversations)
        .orderBy(sql`created_at desc`)
        .limit(5)
    )) ?? [];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Overview
      </h1>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Conversations" value={convCount} />
        <StatCard label="Active" value={activeCount} />
        <StatCard label="Resolved" value={resolvedCount} />
        <StatCard label="Avg Rating" value={feedbackCount > 0 ? avgRating : "—"} />
        <StatCard label="Feedback Received" value={feedbackCount} />
        <StatCard label="KB Documents" value={kbCount} />
      </div>

      <h2 className="mt-10 font-display text-lg font-semibold tracking-tight">
        Recent Conversations
      </h2>

      <div className="mt-4 flex flex-col">
        {recentConvs.map((conv) => (
          <a
            key={conv.id}
            href={`/dashboard/conversations/${conv.id}`}
            className="flex items-center justify-between border-t border-foreground/10 py-3 text-sm transition-colors hover:text-brand"
          >
            <div className="flex items-center gap-3">
              <span
                className={`h-2 w-2 rounded-full ${
                  conv.status === "active"
                    ? "bg-green-500"
                    : "bg-muted"
                }`}
              />
              <span className="font-medium">{conv.customerId}</span>
            </div>
            <span className="text-muted">
              {new Date(conv.createdAt).toLocaleDateString()}
            </span>
          </a>
        ))}

        {recentConvs.length === 0 && (
          <p className="py-8 text-sm text-muted">No conversations yet.</p>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-foreground/10 bg-surface-elevated px-5 py-4">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold tracking-tight">
        {value}
      </p>
    </div>
  );
}
