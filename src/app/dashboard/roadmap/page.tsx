"use client";

import { useState } from "react";
import { Route, Loader2 } from "lucide-react";

interface RoadmapStep {
  title: string;
  timeframe: string;
  focus: string;
  milestones: string[];
}

interface CareerRoadmapResult {
  summary: string;
  steps: RoadmapStep[];
}

export default function RoadmapPage() {
  const [targetRole, setTargetRole] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [result, setResult] = useState<CareerRoadmapResult | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole,
          currentRole: currentRole || undefined,
          resumeText: resumeText || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? data?.error ?? "Something went wrong");
      setResult(data.result as CareerRoadmapResult);
      setProvider((data.provider as string | null) ?? null);
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
          <Route className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">Career Roadmap</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Get a realistic, phased plan to reach your target role with concrete milestones.
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-border bg-card p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="target" className="text-sm font-medium">Target role</label>
            <input
              id="target"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Engineering Manager"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="current" className="text-sm font-medium">
              Current role <span className="text-muted-foreground">(optional)</span>
            </label>
            <input
              id="current"
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              placeholder="e.g. Senior Engineer"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="resume" className="text-sm font-medium">
            Resume text <span className="text-muted-foreground">(optional, improves accuracy)</span>
          </label>
          <textarea
            id="resume"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={8}
            placeholder="Paste the contents of your resume here..."
            className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <button
          type="submit"
          disabled={loading || targetRole.trim().length < 2}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Building..." : "Build roadmap"}
        </button>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </form>

      {result && (
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">{result.summary}</p>
          <ol className="space-y-4">
            {result.steps.map((step, i) => (
              <li key={i} className="relative rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-semibold">
                    <span className="mr-2 text-primary">{i + 1}.</span>
                    {step.title}
                  </h2>
                  <span className="shrink-0 rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {step.timeframe}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{step.focus}</p>
                <ul className="mt-3 space-y-1.5">
                  {step.milestones.map((m, j) => (
                    <li key={j} className="flex gap-2 text-sm">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>

          {provider ? (
            <p className="text-xs text-muted-foreground">Generated with {provider}.</p>
          ) : (
            <p className="text-xs text-muted-foreground">Generated with the built-in engine. Add an AI key for a more tailored plan.</p>
          )}
        </div>
      )}
    </div>
  );
}
