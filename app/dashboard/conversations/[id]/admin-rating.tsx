"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminRating({
  conversationId,
  currentRating,
  currentComment,
}: {
  conversationId: number;
  currentRating: number | null;
  currentComment: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(currentRating ?? 0);
  const [comment, setComment] = useState(currentComment ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/conversations/rate", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, rating, comment }),
      });
      setOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex cursor-pointer items-center gap-2 rounded-full border border-foreground/15 bg-surface-elevated px-5 py-2 text-sm font-medium transition-colors hover:border-foreground/30"
      >
        {currentRating ? (
          <span>Edit rating &mdash; {currentRating}/5</span>
        ) : (
          <span>Add rating</span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-foreground/10 bg-surface-elevated p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <p className="font-display text-base font-semibold">Admin Rating</p>
              <button
                onClick={() => setOpen(false)}
                className="flex cursor-pointer items-center justify-center rounded-full p-1.5 text-muted transition-colors hover:bg-foreground/10 hover:text-foreground"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="mt-0.5 text-xs text-muted">Rate how well the AI handled this conversation.</p>

            <div className="mt-4 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`cursor-pointer text-2xl transition-colors ${
                    star <= rating ? "text-accent" : "text-foreground/20 hover:text-accent/50"
                  }`}
                >
                  ★
                </button>
              ))}
              <span className="ml-2 text-xs text-muted">
                {rating > 0 ? `${rating}/5` : "Not rated"}
              </span>
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Optional notes about this conversation..."
              rows={3}
              className="mt-4 w-full resize-none rounded-lg border border-foreground/10 bg-background px-4 py-2.5 text-sm outline-none focus:border-brand placeholder:text-muted"
            />

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="cursor-pointer rounded-full px-5 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || rating === 0}
                className="flex cursor-pointer items-center gap-2 rounded-full bg-brand px-6 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {saving && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                Save rating
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
