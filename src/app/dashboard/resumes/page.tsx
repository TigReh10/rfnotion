"use client";

import { useState } from "react";
import Link from "next/link";

type Analysis = {
  overallScore: number;
  atsScore: number;
  formattingScore: number;
  readabilityScore: number;
  keywordScore: number;
  sectionScores: Record<string, number>;
  missingSkills: string[];
  recommendations: { title: string; detail: string; severity: string }[];
  provider: string | null;
};

function scoreColor(n: number): string {
  if (n >= 80) return "text-green-600";
  if (n >= 60) return "text-yellow-600";
  return "text-red-600";
}

function severityClass(sev: string): string {
  if (sev === "high") return "bg-red-500/10 text-red-600";
  if (sev === "medium") return "bg-yellow-500/10 text-yellow-700";
  return "bg-green-500/10 text-green-600";
}

function Bar({ label, value }: { label: string; value: number }) {
  const fill = { width: `${Math.max(0, Math.min(100, value))}%` };
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
        <span className="capitalize">{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={fill} />
      </div>
    </div>
  );
}

export default function ResumesPage() {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Analysis | null>(null);

  async function analyze() {
    setError(null);
    setResult(null);
    if (!file && text.trim().length < 30) {
      setError("Upload a file or paste at least a few lines of your resume.");
      return;
    }
    setLoading(true);
    try {
      const form = new FormData();
      if (file) form.append("file", file);
      if (text.trim()) form.append("text", text.trim());
      const up = await fetch("/api/resumes/upload", { method: "POST", body: form });
      const upData = await up.json();
      if (!up.ok) throw new Error(upData?.error?.message ?? "Upload failed");

      const res = await fetch("/api/resumes/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: upData.resumeId, targetRole: role || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "Analysis failed");
      setResult(data.analysis as Analysis);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const sections = result ? Object.entries(result.sectionScores) : [];

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to dashboard
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Resume Analyzer</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Upload a resume or paste its text to get an ATS score and prioritized fixes.
      </p>

      <div className="mt-8 space-y-4 rounded-xl border bg-card p-6">
        <div>
          <label className="mb-1 block text-sm font-medium">Upload file (PDF, DOCX, TXT)</label>
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground"
          />
        </div>
        <div className="text-center text-xs uppercase tracking-widest text-muted-foreground">or</div>
        <div>
          <label className="mb-1 block text-sm font-medium">Paste resume text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            placeholder="Paste your resume here..."
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Target role (optional)</label>
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Senior Frontend Engineer"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
        )}
        <button
          onClick={analyze}
          disabled={loading}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {loading ? "Analyzing..." : "Analyze resume"}
        </button>
      </div>

      {result && (
        <div className="mt-8 space-y-6">
          <div className="rounded-xl border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">Overall score</p>
            <p className={`text-6xl font-extrabold ${scoreColor(result.overallScore)}`}>
              {result.overallScore}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {result.provider ? `Analyzed by ${result.provider}` : "Analyzed by the ResumeForge engine"}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 rounded-xl border bg-card p-6 sm:grid-cols-2">
            <Bar label="ATS" value={result.atsScore} />
            <Bar label="Keywords" value={result.keywordScore} />
            <Bar label="Formatting" value={result.formattingScore} />
            <Bar label="Readability" value={result.readabilityScore} />
          </div>

          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold">Section scores</h3>
            <div className="mt-4 space-y-3">
              {sections.map(([name, value]) => (
                <Bar key={name} label={name} value={Number(value)} />
              ))}
            </div>
          </div>

          {result.missingSkills && result.missingSkills.length > 0 && (
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold">Suggested skills to add</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {result.missingSkills.map((s) => (
                  <span key={s} className="rounded-full bg-muted px-3 py-1 text-xs">{s}</span>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold">Recommendations</h3>
            <ul className="mt-4 space-y-4">
              {result.recommendations.map((r, i) => (
                <li key={i} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{r.title}</p>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${severityClass(r.severity)}`}>
                      {r.severity}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{r.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
