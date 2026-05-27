"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function StatusActions({
  conversationId,
  status,
}: {
  conversationId: number;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(newStatus: string) {
    setLoading(true);
    try {
      await fetch("/api/conversations/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, status: newStatus }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (status === "resolved") return null;

  return (
    <div className="flex gap-2">
      {status === "active" && (
        <button
          onClick={() => updateStatus("escalated")}
          disabled={loading}
          className="rounded-full border border-red-500/30 px-5 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10 disabled:opacity-50"
        >
          Escalate
        </button>
      )}
      <button
        onClick={() => updateStatus("resolved")}
        disabled={loading}
        className="rounded-full bg-brand px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        Mark resolved
      </button>
    </div>
  );
}
