"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm baki. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          conversationId,
        }),
      });

      const data = await res.json();
      setConversationId(data.conversationId);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
      setShowFeedback(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleFeedback(value: number) {
    setRating(value);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          rating: value,
        }),
      });
      setFeedbackSent(true);
    } catch {
      // silently fail
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg transition-transform hover:scale-105"
        aria-label="Toggle chat"
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex w-[380px] max-w-[calc(100vw-48px)] flex-col rounded-2xl border border-foreground/10 bg-background shadow-2xl">
          <div className="flex items-center gap-3 border-b border-foreground/10 px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
              B
            </div>
            <div>
              <p className="font-display text-sm font-semibold">baki</p>
              <p className="text-xs text-muted">AI Support Agent</p>
            </div>
          </div>

          <div className="flex h-[400px] flex-col gap-3 overflow-y-auto px-5 py-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-brand text-white"
                      : "bg-surface-elevated text-foreground"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-surface-elevated px-4 py-2.5 text-sm">
                  <span className="inline-flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:0.1s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:0.2s]" />
                  </span>
                </div>
              </div>
            )}

            {showFeedback && !feedbackSent && !loading && (
              <div className="flex flex-col items-center gap-2 rounded-xl bg-surface-elevated px-4 py-3">
                <p className="text-xs text-muted">How was this response?</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleFeedback(star)}
                      className={`text-lg transition-colors ${
                        star <= rating
                          ? "text-accent"
                          : "text-foreground/20 hover:text-accent/50"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            )}

            {feedbackSent && (
              <div className="rounded-xl bg-surface-elevated px-4 py-2 text-center text-xs text-muted">
                Thanks for your feedback!
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 border-t border-foreground/10 px-4 py-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={loading}
              className="flex-1 rounded-full bg-surface-elevated px-4 py-2 text-sm outline-none placeholder:text-muted disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
