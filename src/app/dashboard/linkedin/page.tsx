"use client";

import { useState } from "react";
import { Linkedin, Copy, Check, Loader2 } from "lucide-react";

interface Suggestion {
  section: string;
  suggestion: string;
}

interface Result {
  id?: string;
  headline: string;
  about: string;
  suggestions: Suggestion[];
  provider?: string | null;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard unavailable */
        }
      }}
      className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition hover:bg-muted"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function LinkedInPage() {
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, targetRole: targetRole || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Something went wrong");
      setResult(data as Result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Linkedin className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">LinkedIn Optimizer</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Paste your resume and we'll craft an optimized headline, About section, and concrete profile tips.
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-border bg-card p-5">
        <div className="space-y-1.5">
          <label htmlFor="role" className="text-sm font-medium">
            Target role <span className="text-muted-foreground">(optional)</span>
          </label>
          <input
            id="role"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Senior Frontend Engineer"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="resume" className="text-sm font-medium">
            Resume text
          </label>
          <textarea
            id="resume"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={10}
            placeholder="Paste the contents of your resume here..."
            className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <button
          type="submit"
          disabled={loading || resumeText.trim().length < 30}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Optimizing..." : "Optimize profile"}
        </button>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </form>

      {result && (
        <div className="space-y-5">
          <section className="space-y-2 rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Headline</h2>
              <CopyButton value={result.headline} />
            </div>
            <p className="text-base">{result.headline}</p>
          </section>

          <section className="space-y-2 rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">About</h2>
              <CopyButton value={result.about} />
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{result.about}</p>
          </section>

          <section className="space-y-3 rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Suggestions</h2>
            <ul className="space-y-3">
              {result.suggestions.map((s, i) => (
                <li key={i} className="rounded-lg border border-border/60 bg-background p-3">
                  <p className="text-sm font-medium">{s.section}</p>
                  <p className="text-sm text-muted-foreground">{s.suggestion}</p>
                </li>
              ))}
            </ul>
          </section>

          {result.provider ? (
            <p className="text-xs text-muted-foreground">Generated with {result.provider}.</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Generated with the built-in engine. Add an AI key for richer, tailored output.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
