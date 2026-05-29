import { db } from "@/db";
import { feedback } from "@/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

const categoryMeta: Record<string, { label: string; color: string }> = {
  bug: { label: "Bug", color: "text-red-500 bg-red-500/10" },
  suggestion: { label: "Suggestion", color: "text-blue-500 bg-blue-500/10" },
  other: { label: "Other", color: "text-muted bg-foreground/5" },
};

export default async function FeedbackPage() {
  let rows: typeof feedback.$inferSelect[] = [];

  try {
    rows = await db
      .select()
      .from(feedback)
      .orderBy(sql`created_at desc`);
  } catch {
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Feedback
      </h1>
      <p className="mt-1 text-sm text-muted">
        User-submitted feedback from the widget.
      </p>

      <div className="mt-6 flex flex-col">
        <div className="grid grid-cols-[120px_1fr_140px] gap-4 border-b border-foreground/10 px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted">
          <span>Category</span>
          <span>Message</span>
          <span>Date</span>
        </div>

        {rows.map((fb) => {
          const meta = categoryMeta[fb.category] ?? categoryMeta.other;
          return (
            <div
              key={fb.id}
              className="grid grid-cols-[120px_1fr_140px] items-start gap-4 border-b border-foreground/10 px-4 py-4 text-sm"
            >
              <span className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-medium ${meta.color}`}>
                {meta.label}
              </span>
              <span className="text-foreground leading-relaxed">{fb.message}</span>
              <span className="text-muted pt-0.5">
                {new Date(fb.createdAt).toLocaleDateString()}
              </span>
            </div>
          );
        })}

        {rows.length === 0 && (
          <p className="py-12 text-center text-sm text-muted">
            No feedback yet.
          </p>
        )}
      </div>
    </div>
  );
}
