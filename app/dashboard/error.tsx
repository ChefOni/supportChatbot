"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[baki] Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <div className="max-w-sm">
        <p className="font-display text-4xl font-bold text-brand">!</p>
        <h2 className="mt-4 font-display text-xl font-semibold tracking-tight">
          Page error
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          This section ran into a problem. This is usually caused by a database
          connection issue — make sure your database is running.
        </p>
        {error?.message && (
          <p className="mt-4 rounded-lg bg-surface-elevated px-4 py-3 font-mono text-xs text-foreground/60">
            {error.message}
          </p>
        )}
        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="rounded-full border border-foreground/15 px-5 py-2.5 text-sm font-medium transition-colors hover:border-foreground/30"
          >
            Back to overview
          </Link>
        </div>
      </div>
    </div>
  );
}
