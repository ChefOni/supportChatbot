"use client";

import { useEffect } from "react";

/**
 * global-error.tsx catches errors in the root layout itself.
 * It replaces the entire <html> document, so it must include <html> and <body>.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[baki] Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#f5f4f0",
          color: "#1a1a1a",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 400, padding: "0 24px" }}>
          <p style={{ fontSize: 48, fontWeight: 700, color: "#5057c7" }}>!</p>
          <h1 style={{ fontSize: 24, fontWeight: 600, marginTop: 16 }}>
            Something went wrong
          </h1>
          <p style={{ marginTop: 12, fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>
            A critical error occurred. Please try again or refresh the page.
          </p>
          {error?.message && (
            <p
              style={{
                marginTop: 16,
                padding: "10px 16px",
                background: "#ebebeb",
                borderRadius: 8,
                fontFamily: "monospace",
                fontSize: 12,
                color: "#555",
              }}
            >
              {error.message}
            </p>
          )}
          <div style={{ marginTop: 32, display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              onClick={reset}
              style={{
                borderRadius: 999,
                background: "#5057c7",
                color: "#fff",
                border: "none",
                padding: "10px 24px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                borderRadius: 999,
                border: "1px solid #d1d5db",
                padding: "10px 24px",
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
