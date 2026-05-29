"use client";

import { useEffect, useState, useRef } from "react";

type KbDoc = {
  id: number;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
};

export default function KnowledgeBasePage() {
  const [docs, setDocs] = useState<KbDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editing, setEditing] = useState<KbDoc | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [reEmbedding, setReEmbedding] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadDocs() {
    try {
      const res = await fetch("/api/kb");
      if (res.ok) setDocs(await res.json());
    } catch {
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDocs();
  }, []);

  function resetForm() {
    setTitle("");
    setContent("");
    setTags("");
    setEditing(null);
  }

  function openAdd() {
    resetForm();
    setSidebarOpen(true);
  }

  function startEdit(doc: KbDoc) {
    setEditing(doc);
    setTitle(doc.title);
    setContent(doc.content);
    setTags(doc.tags.join(", "));
    setSidebarOpen(true);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (!editing && !title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
      setContent((prev) => prev + (prev ? "\n\n" : "") + text);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body = {
      title,
      content,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    try {
      if (editing) {
        await fetch(`/api/kb/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        await fetch("/api/kb", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      setSidebarOpen(false);
      resetForm();
      loadDocs();
    } catch {
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    setDeleting(id);
    try {
      await fetch(`/api/kb/${id}`, { method: "DELETE" });
      loadDocs();
    } catch {
    } finally {
      setDeleting(null);
    }
  }

  async function handleReEmbed() {
    setReEmbedding(true);
    try {
      await fetch("/api/kb/embed", { method: "POST" });
      alert("Re-embedding triggered!");
    } catch {
    } finally {
      setReEmbedding(false);
    }
  }

  function Spinner() {
    return (
      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Knowledge Base
        </h1>
        <div className="flex gap-2">
          <button
            onClick={handleReEmbed}
            disabled={reEmbedding}
            className="flex cursor-pointer items-center rounded-full border border-foreground/15 px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-elevated disabled:opacity-50"
          >
            {reEmbedding && <Spinner />}
            Re-embed all
          </button>
          <button
            onClick={openAdd}
            className="cursor-pointer rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Add document
          </button>
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => { setSidebarOpen(false); resetForm(); }}
          />
          <div className="relative z-10 flex h-full w-full max-w-lg flex-col bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-foreground/10 px-6 py-4">
              <h2 className="font-display text-base font-semibold">
                {editing ? "Edit document" : "Add document"}
              </h2>
              <button
                onClick={() => { setSidebarOpen(false); resetForm(); }}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-elevated hover:text-foreground"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
              <div>
                <label className="text-sm font-medium">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-foreground/10 bg-surface-elevated px-4 py-2 text-sm outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Content</label>
                <div className="mt-1 flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.md"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-foreground/15 px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface-elevated"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    Upload .txt or .md
                  </button>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={10}
                  className="mt-2 w-full resize-none rounded-lg border border-foreground/10 bg-surface-elevated px-4 py-2.5 text-sm outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Tags <span className="text-muted">(comma separated)</span>
                </label>
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-foreground/10 bg-surface-elevated px-4 py-2 text-sm outline-none focus:border-brand"
                />
              </div>

              <div className="mt-auto flex gap-2 border-t border-foreground/10 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex cursor-pointer items-center rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {saving && <Spinner />}
                  {editing ? "Save changes" : "Add document"}
                </button>
                <button
                  type="button"
                  onClick={() => { setSidebarOpen(false); resetForm(); }}
                  className="cursor-pointer rounded-full border border-foreground/15 px-5 py-2 text-sm font-medium transition-colors hover:bg-surface-elevated"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col">
        {loading && (
          <p className="py-12 text-center text-sm text-muted">Loading...</p>
        )}

        {!loading && docs.length === 0 && (
          <p className="py-12 text-center text-sm text-muted">
            No documents yet. Add one to get started.
          </p>
        )}

        {docs.map((doc) => (
          <div
            key={doc.id}
            className="flex items-start justify-between border-t border-foreground/10 py-4"
          >
            <div className="flex-1">
              <h3 className="font-display text-base font-semibold">
                {doc.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">
                {doc.content}
              </p>
              {doc.tags.length > 0 && (
                <div className="mt-2 flex gap-1.5">
                  {doc.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs text-brand"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex shrink-0 gap-2 pl-4">
              <button
                onClick={() => startEdit(doc)}
                className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface-elevated hover:text-foreground"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(doc.id)}
                disabled={deleting === doc.id}
                className="flex cursor-pointer items-center rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-500/10 disabled:opacity-50"
              >
                {deleting === doc.id && (
                  <svg className="animate-spin -ml-1 mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
