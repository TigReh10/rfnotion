"use client";

import Link from "next/link";
import { useState } from "react";
import { GraduationCap, Loader2 } from "lucide-react";

interface SkillGapItem {
  skill: string;
  priority: "low" | "medium" | "high";
  reason: string;
  resource: string;
}

interface SkillGapResult {
  presentSkills: string[];
  missingSkills: SkillGapItem[];
  readinessScore: number;
}

const PRIORITY_STYLES: Record<SkillGapItem["priority"], string> = {
  high: "bg-red-500/10 text-red-500 border-red-500/30",
  medium: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  low: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
};

export default function SkillsPage() {
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [result, setResult] = useState<SkillGapResult | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, targetRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? data?.error ?? "Something went wrong");
      setResult(data.result as SkillGapResult);
      setProvider((data.provider as string | null) ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-12">
      <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to dashboard
      </Link>
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">Skill Gap Analysis</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          See how ready you are for a target role and exactly which skills to build next.
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-border bg-card p-5">
        <div className="space-y-1.5">
          <label htmlFor="role" className="text-sm font-medium">Target role</label>
          <input
            id="role"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Backend Engineer"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="resume" className="text-sm font-medium">Resume text</label>
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
          disabled={loading || resumeText.trim().length < 30 || targetRole.trim().length < 2}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Analyzing..." : "Analyze skills"}
        </button>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </form>

      {result && (
        <div className="space-y-5">
          <section className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Readiness</h2>
              <span className="text-2xl font-semibold">{result.readinessScore}%</span>
            </div>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${result.readinessScore}%` }} />
            </div>
          </section>

          {result.presentSkills.length > 0 && (
            <section className="space-y-3 rounded-xl border border-border bg-card p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Skills you already have</h2>
              <div className="flex flex-wrap gap-2">
                {result.presentSkills.map((s, i) => (
                  <span key={i} className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-500">
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section className="space-y-3 rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Skills to build</h2>
            {result.missingSkills.length === 0 ? (
              <p className="text-sm text-muted-foreground">No major gaps detected for this role. Nice work!</p>
            ) : (
              <ul className="space-y-3">
                {result.missingSkills.map((s, i) => (
                  <li key={i} className="rounded-lg border border-border/60 bg-background p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{s.skill}</p>
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${PRIORITY_STYLES[s.priority]}`}>
                        {s.priority}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{s.reason}</p>
                    <p className="mt-1 text-sm"><span className="font-medium">How to learn:</span> {s.resource}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {provider ? (
            <p className="text-xs text-muted-foreground">Generated with {provider}.</p>
          ) : (
            <p className="text-xs text-muted-foreground">Generated with the built-in engine. Add an AI key for deeper analysis.</p>
          )}
        </div>
      )}
    </main>
  );
}
