"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

function useWidgetConfig() {
  const [config, setConfig] = useState({
    accentColor: "",
    position: "",
    bubbleText: "",
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("baki_chat_config") || localStorage.getItem("baki_widget_config");
      if (stored) {
        const parsed = JSON.parse(stored);
        setConfig({
          accentColor: parsed.accentColor ?? "",
          position: parsed.position ?? "",
          bubbleText: parsed.bubbleText ?? "",
        });
      }
    } catch {
    }
  }, []);

  return config;
}

export function ChatWidget() {
  const cfg = useWidgetConfig();
  const accent = cfg.accentColor || undefined;
  const rightPos = cfg.position !== "bottom-left";
  const bubbleLabel = cfg.bubbleText || "Chat with us";
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

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 z-50 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105 ${rightPos ? "right-6" : "left-6"}`}
        style={accent ? { backgroundColor: accent } : undefined}
        aria-label={bubbleLabel}
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
        <div className={`fixed bottom-24 z-50 flex w-[380px] max-w-[calc(100vw-48px)] flex-col rounded-2xl border border-foreground/10 bg-background shadow-2xl ${rightPos ? "right-6" : "left-6"}`}>
          <div className="flex items-center gap-3 border-b border-foreground/10 px-5 py-4">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
              style={accent ? { backgroundColor: accent } : undefined}
            >
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
                      ? "text-white"
                      : "bg-surface-elevated text-foreground"
                  }`}
                  style={
                    msg.role === "user" && accent
                      ? { backgroundColor: accent }
                      : undefined
                  }
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
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-white disabled:opacity-50"
                style={accent ? { backgroundColor: accent } : undefined}
              >
              {loading ? (
                <svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
