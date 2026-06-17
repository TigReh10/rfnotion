import Link from "next/link";

const FEATURES = [
  { title: "ATS Resume Analyzer", desc: "Section-by-section scoring with actionable fixes." },
  { title: "Job Match Engine", desc: "See your fit %, missing keywords and suggested edits." },
  { title: "Cover Letters", desc: "Tailored, tone-controlled letters in seconds." },
  { title: "LinkedIn Optimizer", desc: "Stronger headline and About section." },
  { title: "Interview Prep", desc: "Behavioral and technical questions with model answers." },
  { title: "Version Tracking", desc: "Keep every iteration of every resume." },
];

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-5 md:px-12">
        <span className="text-lg font-bold">ResumeForge AI</span>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/login" className="text-muted-foreground hover:text-foreground">
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground"
          >
            Get started
          </Link>
        </nav>
      </header>

      <section className="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
          Land more interviews with an AI-optimized resume
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          ResumeForge AI scores your resume against any job, rewrites it for ATS systems, and
          generates tailored cover letters and interview prep \u2014 in seconds.
        </p>
        <Link
          href="/register"
          className="mt-10 rounded-lg bg-primary px-8 py-3 text-base font-semibold text-primary-foreground"
        >
          Analyze my resume free
        </Link>
      </section>

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 pb-24 md:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
