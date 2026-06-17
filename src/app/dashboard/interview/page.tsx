"use client";

import { useState } from "react";
import Link from "next/link";

type QA = { question: string; answer: string };
type Prep = {
  behavioral: QA[];
  technical: QA[];
  followUps: string[];
};

function QaList({ items }: { items: QA[] }) {
  return (
    <div className="mt-4 space-y-3">
      {items.map((qa, i) => (
        <details key={i} className="rounded-lg border p-4">
          <summary className="cursor-pointer text-sm font-medium">{qa.question}</summary>
          <p className="mt-2 text-sm text-muted-foreground">{qa.answer}</p>
        </details>
      ))}
    </div>
  );
}

export default function InterviewPage() {
  const [resumeText, setResumeText] = useState("");
  const [jobText, setJobText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prep, setPrep] = useState<Prep | null>(null);

  async function generate() {
    setError(null);
    if (resumeText.trim().length < 30) {
      setError("Paste at least a few lines of your resume.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: resumeText.trim(),
          jobText: jobText.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "Generation failed");
      setPrep(data.prep as Prep);
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
      <h1 className="mt-4 text-2xl font-bold">Interview Prep</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Practice likely behavioral and technical questions with model answers.
      </p>

      <div className="mt-8 space-y-4 rounded-xl border bg-card p-6">
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
          <label className="mb-1 block text-sm font-medium">Job description (optional)</label>
          <textarea
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            rows={5}
            placeholder="Paste the job description to tailor questions..."
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
        )}
        <button
          onClick={generate}
          disabled={loading}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {loading ? "Generating..." : "Generate questions"}
        </button>
      </div>

      {prep && (
        <div className="mt-8 space-y-8">
          <section>
            <h3 className="font-semibold">Behavioral questions</h3>
            <QaList items={prep.behavioral} />
          </section>
          <section>
            <h3 className="font-semibold">Technical questions</h3>
            <QaList items={prep.technical} />
          </section>
          {prep.followUps && prep.followUps.length > 0 && (
            <section>
              <h3 className="font-semibold">Follow-up prompts</h3>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                {prep.followUps.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
