"use client";

import { useState, useRef, useEffect } from "react";

const CATEGORIES = [
  { value: "bug", label: "Bug", icon: "🐛" },
  { value: "suggestion", label: "Suggestion", icon: "💡" },
  { value: "other", label: "Other", icon: "💬" },
];

function useWidgetConfig() {
  const [config, setConfig] = useState({ accentColor: "", position: "" });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("baki_feedback_config");
      if (stored) {
        const parsed = JSON.parse(stored);
        setConfig({
          accentColor: parsed.accentColor ?? "",
          position: parsed.position ?? "",
        });
      }
    } catch {
    }
  }, []);

  return config;
}

export function FeedbackWidget() {
  const cfg = useWidgetConfig();
  const accent = cfg.accentColor || undefined;
  const rightPos = cfg.position !== "bottom-left";
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) textRef.current?.focus();
  }, [open]);

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

  function reset() {
    setOpen(false);
    setCategory("");
    setMessage("");
    setDone(false);
  }

  const offset = cfg.position !== "bottom-left" ? "right-24" : "left-24";

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 z-40 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105 ${rightPos ? "right-24" : "left-24"}`}
        style={accent ? { backgroundColor: accent } : undefined}
        aria-label="Give feedback"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      </button>

      {open && (
        <div className={`fixed bottom-24 z-40 flex w-[380px] max-w-[calc(100vw-48px)] flex-col rounded-2xl border border-foreground/10 bg-background shadow-2xl ${rightPos ? "right-24" : "left-24"}`}>
          <div className="flex items-center gap-3 border-b border-foreground/10 px-5 py-4">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
              style={accent ? { backgroundColor: accent } : undefined}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <p className="font-display text-sm font-semibold">Submit Feedback</p>
          </div>

          <div className="px-5 py-4">
            {done ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full text-white"
                  style={accent ? { backgroundColor: accent } : undefined}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm font-medium">Thanks for your feedback!</p>
                <p className="text-xs text-muted">We appreciate you taking the time.</p>
                <button
                  onClick={reset}
                  className="mt-2 cursor-pointer rounded-full bg-foreground/10 px-5 py-2 text-xs font-medium transition-colors hover:bg-foreground/20"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <p className="text-sm font-medium text-muted">Category</p>
                  <div className="mt-2 flex gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setCategory(cat.value)}
                        className={`flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                          category === cat.value
                            ? "bg-brand text-white"
                            : "bg-surface-elevated text-muted hover:text-foreground"
                        }`}
                        style={
                          category === cat.value && accent
                            ? { backgroundColor: accent }
                            : undefined
                        }
                      >
                        <span>{cat.icon}</span>
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted">Message</label>
                  <textarea
                    ref={textRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your feedback..."
                    required
                    rows={4}
                    className="mt-1.5 w-full resize-none rounded-lg border border-foreground/10 bg-surface-elevated px-4 py-3 text-sm outline-none focus:border-brand placeholder:text-muted"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!category || !message.trim() || sending}
                  className="flex cursor-pointer items-center justify-center gap-2 self-start rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={accent ? { backgroundColor: accent } : undefined}
                >
                  {sending && (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  Send feedback
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
