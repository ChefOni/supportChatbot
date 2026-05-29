"use client";

import { useEffect, useState, useCallback } from "react";

type Insights = {
  commonIssues: string[];
  sentiment: string;
  urgentPatterns: string[];
  recommendation: string;
  totalConversations: number;
  totalFeedback: number;
  avgRating: string | null;
};

export default function InsightsPage() {
  const [data, setData] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/insights");
      setData(await res.json());
      setHasRun(true);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Insights
        </h1>
        <button
          onClick={fetchInsights}
          disabled={loading}
          className="flex cursor-pointer items-center gap-2 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading && (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {loading ? "Generating..." : hasRun ? "Regenerate insights" : "Generate insights"}
        </button>
      </div>

      {loading && (
        <p className="mt-8 text-sm text-muted">Analyzing conversations...</p>
      )}

      {!loading && !hasRun && (
        <p className="mt-8 text-sm text-muted">
          Click &quot;Generate insights&quot; to analyze conversations and feedback.
        </p>
      )}

      {!loading && hasRun && (!data || data.commonIssues.length === 0) && (
        <p className="mt-8 text-sm text-muted">
          Not enough data to generate insights yet. Keep collecting conversations
          and feedback.
        </p>
      )}

      {!loading && data && data.commonIssues.length > 0 && (
        <>
          <p className="mt-1 text-sm text-muted">
            AI-generated analysis based on{" "}
            {data.totalConversations} conversations and {data.totalFeedback} feedback
            entries.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-foreground/10 p-5">
              <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted">
                Common Issues
              </h2>
              <ul className="mt-4 flex flex-col gap-3">
                {data.commonIssues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                      {i + 1}
                    </span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-foreground/10 p-5">
              <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted">
                Sentiment
              </h2>
              <p className="mt-4 text-sm">{data.sentiment}</p>

              {data.avgRating && (
                <div className="mt-6">
                  <p className="text-xs font-medium text-muted">Avg Rating</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-display text-3xl font-bold tracking-tight text-brand">
                      {data.avgRating}
                    </span>
                    <span className="text-sm text-muted">/ 5</span>
                  </div>
                </div>
              )}
            </div>

            {data.urgentPatterns.length > 0 && (
              <>
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
                  <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-red-500">
                    Needs Attention
                  </h2>
                  <ul className="mt-4 flex flex-col gap-2">
                    {data.urgentPatterns.map((pattern, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="mt-0.5 text-red-400">&#9888;</span>
                        {pattern}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            <div className="rounded-xl border border-brand/20 bg-brand/5 p-5">
              <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-brand">
                Recommendation
              </h2>
              <p className="mt-4 text-sm leading-relaxed">{data.recommendation}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
