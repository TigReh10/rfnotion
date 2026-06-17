"use client";

import { useState } from "react";
import Link from "next/link";

type Match = {
  matchScore: number;
  missingKeywords: string[];
  missingSkills: string[];
  suggestedEdits: { section: string; suggestion: string }[];
};

function scoreColor(n: number): string {
  if (n >= 75) return "text-green-600";
  if (n >= 50) return "text-yellow-600";
  return "text-red-600";
}

export default function JobMatchPage() {
  const [resumeText, setResumeText] = useState("");
  const [jobText, setJobText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Match | null>(null);

  async function run() {
    setError(null);
    setResult(null);
    if (resumeText.trim().length < 30 || jobText.trim().length < 30) {
      setError("Paste both your resume and the job description.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/jobs/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: resumeText.trim(), jobText: jobText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "Match failed");
      setResult(data.match as Match);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to dashboard
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Job Match</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Compare your resume against a job description to see your fit and what is missing.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 rounded-xl border bg-card p-6 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Your resume</label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={10}
            placeholder="Paste your resume..."
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Job description</label>
          <textarea
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            rows={10}
            placeholder="Paste the job description..."
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      <button
        onClick={run}
        disabled={loading}
        className="mt-4 w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {loading ? "Comparing..." : "Compare"}
      </button>

      {result && (
        <div className="mt-8 space-y-6">
          <div className="rounded-xl border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">Job fit</p>
            <p className={`text-6xl font-extrabold ${scoreColor(result.matchScore)}`}>
              {result.matchScore}%
            </p>
          </div>

          {result.missingSkills && result.missingSkills.length > 0 && (
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold">Missing skills</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {result.missingSkills.map((s) => (
                  <span key={s} className="rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-600">{s}</span>
                ))}
              </div>
            </div>
          )}

          {result.missingKeywords && result.missingKeywords.length > 0 && (
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold">Missing keywords</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {result.missingKeywords.map((k) => (
                  <span key={k} className="rounded-full bg-muted px-3 py-1 text-xs">{k}</span>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold">Suggested edits</h3>
            <ul className="mt-4 space-y-4">
              {result.suggestedEdits.map((s, i) => (
                <li key={i} className="rounded-lg border p-4">
                  <p className="text-sm font-medium">{s.section}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.suggestion}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
