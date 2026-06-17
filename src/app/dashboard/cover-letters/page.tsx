"use client";

import { useState } from "react";
import Link from "next/link";

const TONES = ["PROFESSIONAL", "ENTHUSIASTIC", "CONCISE", "FORMAL", "CONVERSATIONAL"] as const;
type Tone = (typeof TONES)[number];

export default function CoverLettersPage() {
  const [resumeText, setResumeText] = useState("");
  const [jobText, setJobText] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [tone, setTone] = useState<Tone>("PROFESSIONAL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [letter, setLetter] = useState("");
  const [copied, setCopied] = useState(false);

  async function generate() {
    setError(null);
    setCopied(false);
    if (resumeText.trim().length < 30 || jobText.trim().length < 30) {
      setError("Paste both your resume and the job description.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/cover-letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: resumeText.trim(),
          jobText: jobText.trim(),
          tone,
          company: company.trim() || undefined,
          role: role.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "Generation failed");
      setLetter(data.content as string);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to dashboard
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Cover Letters</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Generate a tailored, tone-controlled cover letter for any role.
      </p>

      <div className="mt-8 space-y-4 rounded-xl border bg-card p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Your resume</label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={8}
              placeholder="Paste your resume..."
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Job description</label>
            <textarea
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              rows={8}
              placeholder="Paste the job description..."
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Company (optional)</label>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Role (optional)</label>
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as Tone)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm capitalize outline-none focus:ring-2 focus:ring-ring"
            >
              {TONES.map((t) => (
                <option key={t} value={t} className="capitalize">
                  {t.toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
        )}
        <button
          onClick={generate}
          disabled={loading}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {loading ? "Writing..." : "Generate cover letter"}
        </button>
      </div>

      {letter && (
        <div className="mt-8 rounded-xl border bg-card p-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Your cover letter</h3>
            <button
              onClick={copy}
              className="rounded-md border px-3 py-1 text-xs font-medium hover:bg-muted"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <textarea
            value={letter}
            onChange={(e) => setLetter(e.target.value)}
            rows={18}
            className="w-full whitespace-pre-wrap rounded-md border bg-background px-3 py-2 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      )}
    </main>
  );
}
