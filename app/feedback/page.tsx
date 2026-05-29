"use client";

import { useState } from "react";

const CATEGORIES = [
  { value: "bug", label: "Bug", icon: "🐛" },
  { value: "suggestion", label: "Suggestion", icon: "💡" },
  { value: "other", label: "Other", icon: "💬" },
];

export default function FeedbackPage() {
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category || !message.trim() || sending) return;

    setSending(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, message: message.trim() }),
      });
      setDone(true);
    } catch {
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      <div className="w-full max-w-lg">
        <a href="/" className="font-display text-lg font-semibold tracking-tight text-brand">
          baki
        </a>
        <p className="mt-1 text-sm text-muted">We value your input.</p>

        {done ? (
          <div className="mt-12 flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">Thanks for your feedback!</h1>
            <p className="text-sm text-muted">We appreciate you taking the time to help us improve.</p>
            <a
              href="/"
              className="mt-4 rounded-full bg-foreground/10 px-6 py-2.5 text-sm font-medium transition-colors hover:bg-foreground/20"
            >
              Back to home
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-12 flex flex-col gap-6">
            <div>
              <p className="font-display text-base font-semibold">What kind of feedback do you have?</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`flex cursor-pointer items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
                      category === cat.value
                        ? "bg-brand text-white"
                        : "border border-foreground/15 text-muted hover:border-foreground/30 hover:text-foreground"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-display text-base font-semibold" htmlFor="message">
                Tell us more
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your feedback in detail..."
                required
                rows={6}
                className="mt-2 w-full resize-none rounded-xl border border-foreground/10 bg-surface-elevated px-5 py-3.5 text-sm outline-none focus:border-brand placeholder:text-muted"
              />
            </div>

            <button
              type="submit"
              disabled={!category || !message.trim() || sending}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {sending && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              Submit feedback
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
