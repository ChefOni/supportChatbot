"use client";

import { useEffect, useState } from "react";

const DEFAULT_CONFIG = {
  accentColor: "#6366f1",
  position: "bottom-right",
  bubbleText: "Chat with us",
};

function Spinner() {
  return (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function ConfigSection({
  title,
  description,
  storageKey,
  defaultBubbleText,
}: {
  title: string;
  description: string;
  storageKey: string;
  defaultBubbleText: string;
}) {
  const [accentColor, setAccentColor] = useState(DEFAULT_CONFIG.accentColor);
  const [position, setPosition] = useState(DEFAULT_CONFIG.position);
  const [bubbleText, setBubbleText] = useState(defaultBubbleText);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const cfg = JSON.parse(stored);
        setAccentColor(cfg.accentColor ?? DEFAULT_CONFIG.accentColor);
        setPosition(cfg.position ?? DEFAULT_CONFIG.position);
        setBubbleText(cfg.bubbleText ?? defaultBubbleText);
      }
    } catch {
    }
  }, [storageKey, defaultBubbleText]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    localStorage.setItem(
      storageKey,
      JSON.stringify({ accentColor, position, bubbleText })
    );
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-5">
      <div>
        <label className="text-sm font-medium">Accent Color</label>
        <div className="mt-1 flex items-center gap-3">
          <input
            type="color"
            value={accentColor}
            onChange={(e) => setAccentColor(e.target.value)}
            className="h-10 w-10 cursor-pointer rounded-lg border border-foreground/10"
          />
          <input
            value={accentColor}
            onChange={(e) => setAccentColor(e.target.value)}
            className="flex-1 rounded-lg border border-foreground/10 bg-surface-elevated px-4 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Widget Position</label>
        <select
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="mt-1 w-full rounded-lg border border-foreground/10 bg-surface-elevated px-4 py-2.5 text-sm outline-none focus:border-brand"
        >
          <option value="bottom-right">Bottom Right</option>
          <option value="bottom-left">Bottom Left</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium">Bubble Text</label>
        <input
          value={bubbleText}
          onChange={(e) => setBubbleText(e.target.value)}
          className="mt-1 w-full rounded-lg border border-foreground/10 bg-surface-elevated px-4 py-2.5 text-sm outline-none focus:border-brand"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="flex cursor-pointer items-center self-start rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {saving && <Spinner />}
        {saved ? "Saved!" : "Save settings"}
      </button>
    </form>
  );
}

export default function SettingsPage() {
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState("");

  async function handleSeed() {
    setSeeding(true);
    setSeedResult("");
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSeedResult(
          `Seeded ${data.kbDocs} KB documents, ${data.conversations} conversations, ${data.feedback} feedback entries.`
        );
      } else {
        setSeedResult("Seed failed: " + (data.error ?? "unknown error"));
      }
    } catch {
      setSeedResult("Seed failed — is the database running?");
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Settings
      </h1>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div className="max-w-lg">
          <h2 className="font-display text-base font-semibold">
            Chat Widget
          </h2>
          <p className="mt-1 text-sm text-muted">
            Customize the AI support chat widget.
          </p>
          <div className="mt-4">
            <ConfigSection
              title="Chat Widget"
              description="Customize the AI support chat widget."
              storageKey="baki_chat_config"
              defaultBubbleText="Chat with us"
            />
          </div>
        </div>

        <div className="max-w-lg">
          <h2 className="font-display text-base font-semibold">
            Feedback Widget
          </h2>
          <p className="mt-1 text-sm text-muted">
            Customize the feedback submission widget.
          </p>
          <div className="mt-4">
            <ConfigSection
              title="Feedback Widget"
              description="Customize the feedback submission widget."
              storageKey="baki_feedback_config"
              defaultBubbleText="Give feedback"
            />
          </div>
        </div>
      </div>

      <div className="mt-12 max-w-lg border-t border-foreground/10 pt-8">
        <h2 className="font-display text-base font-semibold">
          Demo Data
        </h2>
        <p className="mt-1 text-sm text-muted">
          Seed the database with sample conversations and knowledge base
          documents to test the dashboard.
        </p>

        <button
          onClick={handleSeed}
          disabled={seeding}
          className="flex cursor-pointer items-center mt-4 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {seeding && <Spinner />}
          {seeding ? "Seeding..." : "Seed Demo Data"}
        </button>

        {seedResult && (
          <p
            className={`mt-3 text-sm ${
              seedResult.startsWith("Seeded")
                ? "text-green-600"
                : "text-red-500"
            }`}
          >
            {seedResult}
          </p>
        )}
      </div>
    </div>
  );
}
