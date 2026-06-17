"use client";

import Link from "next/link";
import {
  FileSearch,
  Target,
  PenLine,
  Linkedin,
  MessagesSquare,
  History,
} from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem, Parallax } from "@/components/motion";

const FEATURES = [
  { icon: FileSearch, title: "ATS Resume Analyzer", desc: "Section-by-section scoring with concrete, prioritized fixes." },
  { icon: Target, title: "Job Match Engine", desc: "See your fit %, missing keywords and suggested edits per role." },
  { icon: PenLine, title: "Cover Letters", desc: "Tailored, tone-controlled letters generated in seconds." },
  { icon: Linkedin, title: "LinkedIn Optimizer", desc: "A sharper headline and About section that recruiters notice." },
  { icon: MessagesSquare, title: "Interview Prep", desc: "Behavioral and technical questions with model answers." },
  { icon: History, title: "Version Tracking", desc: "Keep every iteration of every resume, neatly organized." },
];

const STEPS = [
  { n: "01", title: "Upload", desc: "Drop in your resume \u2014 PDF, DOCX or text. We extract it instantly." },
  { n: "02", title: "Analyze", desc: "AI scores it against ATS rules and your target role." },
  { n: "03", title: "Optimize", desc: "Apply suggestions, export, and track every version." },
];

export function Features() {
  return (
    <section id="features" className="relative mx-auto max-w-6xl px-6 py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
          Everything you need to get hired
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          One workspace for analyzing, rewriting and tailoring your application.
        </p>
      </Reveal>

      <StaggerGroup className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <StaggerItem
              key={f.title}
              className="group rounded-2xl border bg-card p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </StaggerItem>
          );
        })}
      </StaggerGroup>
    </section>
  );
}

export function Showcase() {
  return (
    <section className="relative overflow-hidden border-y bg-muted/30 py-28">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 lg:grid-cols-2">
        <Reveal>
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Built for outcomes
          </span>
          <h2 className="mt-4 text-balance text-4xl font-bold tracking-tight md:text-5xl">
            Watch your score climb in real time
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Every suggestion is tied to a measurable ATS improvement. Apply a fix,
            see the score move \u2014 no guesswork.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-6">
            <Stat value="92%" label="Avg. ATS score" />
            <Stat value="3.2x" label="More callbacks" />
            <Stat value="12s" label="To first analysis" />
          </div>
        </Reveal>

        <Parallax distance={60} className="rounded-3xl">
          <div className="rounded-3xl border bg-card p-6 shadow-2xl shadow-black/10">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ATS compatibility</p>
                <p className="text-5xl font-extrabold text-primary">92</p>
              </div>
              <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-600">
                +18 this session
              </span>
            </div>
            <div className="mt-6 space-y-4">
              <Bar label="Keywords" pct={94} />
              <Bar label="Formatting" pct={88} />
              <Bar label="Impact verbs" pct={90} />
              <Bar label="Readability" pct={96} />
            </div>
          </div>
        </Parallax>
      </div>
    </section>
  );
}

export function Steps() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
          Three steps to a sharper resume
        </h2>
      </Reveal>
      <StaggerGroup className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
        {STEPS.map((s) => (
          <StaggerItem key={s.n} className="rounded-2xl border bg-card p-8">
            <p className="text-5xl font-extrabold text-primary/20">{s.n}</p>
            <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}

export function CallToAction() {
  return (
    <section className="relative overflow-hidden px-6 py-32">
      <div className="pointer-events-none absolute inset-0 -z-10 mx-auto max-w-4xl rounded-full bg-primary/20 blur-[140px]" />
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-4xl font-bold tracking-tight md:text-6xl">
          Your next role starts here
        </h2>
        <p className="mt-5 text-lg text-muted-foreground">
          Join thousands optimizing their resumes with AI. Free to start.
        </p>
        <Link
          href="/register"
          className="mt-9 inline-block rounded-full bg-primary px-9 py-4 text-base font-semibold text-primary-foreground transition hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/30"
        >
          Get started free
        </Link>
      </Reveal>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-3xl font-extrabold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function Bar({ label, pct }: { label: string; pct: number }) {
  const width = { width: `${pct}%` };
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={width} />
      </div>
    </div>
  );
}
