"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console for debugging (replace with a real error reporter in production)
    console.error("[baki] Unhandled client error:", error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="max-w-sm">
        <p className="font-display text-5xl font-bold text-brand">!</p>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          An unexpected error occurred. You can try again, or refresh the page
          if the problem persists.
        </p>
        {error?.message && (
          <p className="mt-4 rounded-lg bg-surface-elevated px-4 py-3 font-mono text-xs text-foreground/60">
            {error.message}
          </p>
        )}
        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-full border border-foreground/15 px-6 py-2.5 text-sm font-medium transition-colors hover:border-foreground/30"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
