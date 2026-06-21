/**
 * Deterministic, key-free engines for the advanced ResumeForge features:
 * LinkedIn optimization, skill-gap analysis, and career roadmaps.
 *
 * These mirror the JSON contracts used by the matching AI prompts so callers
 * can transparently fall back to them whenever no AI provider is configured.
 * No external services, no API keys, fully unit-testable.
 */

const SKILLS = [
  "javascript", "typescript", "react", "node", "python", "java", "go", "rust",
  "sql", "nosql", "aws", "gcp", "azure", "docker", "kubernetes", "graphql",
  "rest", "git", "ci/cd", "postgresql", "mysql", "redis", "html", "css",
  "tailwind", "next.js", "express", "django", "kafka", "terraform", "testing",
  "system design", "data structures", "algorithms", "communication",
  "leadership", "agile", "scrum",
];

const ROLE_SKILLS: Record<string, string[]> = {
  frontend: ["javascript", "typescript", "react", "html", "css", "tailwind", "next.js", "testing", "git"],
  backend: ["node", "python", "sql", "postgresql", "redis", "docker", "rest", "graphql", "testing", "git"],
  fullstack: ["javascript", "typescript", "react", "node", "sql", "docker", "rest", "testing", "git", "aws"],
  devops: ["aws", "docker", "kubernetes", "terraform", "ci/cd", "git", "system design"],
  data: ["python", "sql", "nosql", "algorithms", "data structures", "aws"],
  mobile: ["javascript", "typescript", "react", "testing", "git", "rest"],
};

const DEFAULT_RELEVANT = [
  "communication", "leadership", "testing", "git", "system design",
  "data structures", "algorithms",
];

const LEARN_RESOURCE: Record<string, string> = {
  javascript: "Work through a modern JS course and rebuild a small app from scratch.",
  typescript: "Add TypeScript to an existing project and turn on strict mode.",
  react: "Build a small CRUD app using hooks and clean component composition.",
  "next.js": "Ship a small full-stack app with the App Router and server actions.",
  node: "Build a REST API with Express or Fastify and add integration tests.",
  python: "Complete a project-based Python course focused on your domain.",
  sql: "Practice joins and aggregations on a real dataset and explain your queries.",
  postgresql: "Model a schema, add indexes, and analyze a slow query with EXPLAIN.",
  docker: "Containerize one of your projects with a multi-stage Dockerfile.",
  kubernetes: "Deploy a sample app to a local cluster (kind or minikube).",
  aws: "Deploy a project using S3, Lambda, or ECS and document the architecture.",
  terraform: "Provision a small environment using reusable modules.",
  "ci/cd": "Add a pipeline that runs tests and deploys automatically on merge.",
  graphql: "Build a typed GraphQL API and a client that consumes it.",
  testing: "Add unit and integration tests until you reach meaningful coverage.",
  "system design": "Study common patterns and write up two or three mock design docs.",
  "data structures": "Implement core structures from scratch and explain the trade-offs.",
  algorithms: "Drill patterns (two pointers, BFS/DFS, dynamic programming) in timed sets.",
  leadership: "Lead a small initiative end to end and document the outcome.",
  communication: "Write a public technical post and present it to your team.",
};

function cap(s: string): string {
  if (!s) return s;
  if (s === "ci/cd") return "CI/CD";
  if (s === "next.js") return "Next.js";
  if (s === "sql" || s === "nosql" || s === "aws" || s === "gcp" || s === "css" || s === "html") {
    return s.toUpperCase();
  }
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function presentSkills(text: string): string[] {
  const lower = (text || "").toLowerCase();
  return SKILLS.filter((s) => lower.includes(s));
}

function relevantSkillsFor(role?: string): string[] {
  const r = (role || "").toLowerCase();
  for (const key of Object.keys(ROLE_SKILLS)) {
    if (r.includes(key)) return ROLE_SKILLS[key]!;
  }
  if (r.includes("front")) return ROLE_SKILLS.frontend!;
  if (r.includes("back")) return ROLE_SKILLS.backend!;
  if (r.includes("full")) return ROLE_SKILLS.fullstack!;
  if (r.includes("ops") || r.includes("sre") || r.includes("platform")) return ROLE_SKILLS.devops!;
  if (r.includes("data") || r.includes("ml") || r.includes("machine")) return ROLE_SKILLS.data!;
  if (r.includes("mobile") || r.includes("ios") || r.includes("android")) return ROLE_SKILLS.mobile!;
  const merged = ROLE_SKILLS.fullstack!.concat(DEFAULT_RELEVANT);
  return merged.filter((v, i, a) => a.indexOf(v) === i);
}

function guessName(resumeText: string): string {
  const first = (resumeText || "").split(/\r?\n/).map((l) => l.trim()).find(Boolean);
  if (!first || first.includes("@")) return "Your Name";
  const words = first.split(/\s+/);
  if (words.length <= 4 && /^[A-Za-z][A-Za-z.'-]+(\s+[A-Za-z][A-Za-z.'-]+)*$/.test(first)) {
    return first;
  }
  return "Your Name";
}

// ---------- LinkedIn optimizer ----------

export interface LinkedInSuggestion {
  section: string;
  suggestion: string;
}

export interface LinkedInResult {
  headline: string;
  about: string;
  suggestions: LinkedInSuggestion[];
}

export function linkedInLocally(opts: { resumeText: string; targetRole?: string }): LinkedInResult {
  const text = opts.resumeText || "";
  const lower = text.toLowerCase();
  const found = presentSkills(text);
  const top = found.slice(0, 5).map(cap);
  const role = opts.targetRole?.trim() || "Software Engineer";
  const skillsPhrase = top.length ? top.join(", ") : "your core toolkit";
  const name = guessName(text);
  const firstName = name.split(/\s+/)[0] || "there";

  const headlineSkills = top.slice(0, 3).join(" \u00b7 ") || "Building reliable software";
  const headline = `${role} | ${headlineSkills} | Open to new opportunities`;

  const about = [
    `${role} who turns requirements into shipped, measurable results.`,
    `Core strengths: ${skillsPhrase}.`,
    "I value clean execution, clear communication, and steady learning. I'm currently open to roles where I can do work that has real impact while continuing to grow as an engineer.",
    `Let's connect, ${firstName}.`,
  ].join("\n\n");

  const suggestions: LinkedInSuggestion[] = [
    { section: "Headline", suggestion: "Lead with your target title plus two or three signature skills. Recruiters search by keyword, so concrete terms beat vague taglines." },
    { section: "About", suggestion: "Open with one punchy sentence, then two or three lines of measurable wins. Keep it first-person and skip buzzwords like 'results-driven'." },
    { section: "Experience", suggestion: "Mirror your strongest resume bullets here: start with an action verb and include a metric such as a percentage, dollar amount, or time saved." },
    { section: "Skills", suggestion: `Pin your strongest skills (${top.slice(0, 3).join(", ") || "your top three"}) so they surface first and collect endorsements.` },
  ];
  if (!lower.includes("github") && !lower.includes("portfolio")) {
    suggestions.push({ section: "Featured", suggestion: "Add a GitHub repo, portfolio, or write-up to your Featured section so your claims are backed by proof." });
  }

  return { headline, about, suggestions };
}

// ---------- Skill-gap analysis ----------

export interface SkillGapItem {
  skill: string;
  priority: "low" | "medium" | "high";
  reason: string;
  resource: string;
}

export interface SkillGapResult {
  presentSkills: string[];
  missingSkills: SkillGapItem[];
  readinessScore: number;
}

export function skillGapLocally(opts: { resumeText: string; targetRole: string }): SkillGapResult {
  const present = presentSkills(opts.resumeText);
  const relevant = relevantSkillsFor(opts.targetRole);
  const have = relevant.filter((s) => present.includes(s));
  const missing = relevant.filter((s) => !present.includes(s));

  const readinessScore = relevant.length ? clamp((have.length / relevant.length) * 100) : 0;

  const missingSkills: SkillGapItem[] = missing.map((skill, i) => {
    const priority: SkillGapItem["priority"] = i < 2 ? "high" : i < 4 ? "medium" : "low";
    return {
      skill: cap(skill),
      priority,
      reason: `Commonly expected for ${opts.targetRole} roles and not clearly shown on your resume.`,
      resource: LEARN_RESOURCE[skill] ?? `Build a small project that uses ${cap(skill)} and add it to your resume.`,
    };
  });

  return { presentSkills: have.map(cap), missingSkills, readinessScore };
}

// ---------- Career roadmap ----------

export interface RoadmapStep {
  title: string;
  timeframe: string;
  focus: string;
  milestones: string[];
}

export interface CareerRoadmapResult {
  summary: string;
  steps: RoadmapStep[];
}

export function careerRoadmapLocally(opts: {
  targetRole: string;
  currentRole?: string;
  resumeText?: string;
}): CareerRoadmapResult {
  const target = opts.targetRole.trim();
  const current = opts.currentRole?.trim();
  const gap = skillGapLocally({ resumeText: opts.resumeText || "", targetRole: target });
  const priority = gap.missingSkills.filter((s) => s.priority !== "low").map((s) => s.skill);
  const focusSkills = (priority.length ? priority : gap.missingSkills.map((s) => s.skill)).slice(0, 4);
  const focusPhrase = focusSkills.length ? focusSkills.join(", ") : "your core fundamentals";

  const summary = current
    ? `A phased plan to move from ${current} to ${target}, prioritizing the skills you are currently missing.`
    : `A phased plan to grow into a ${target} role, prioritizing the skills you are currently missing.`;

  const steps: RoadmapStep[] = [
    {
      title: "Close the highest-impact gaps",
      timeframe: "0-3 months",
      focus: `Build fluency in ${focusPhrase}.`,
      milestones: [
        `Complete a focused project using ${focusSkills[0] ?? "a priority skill"}.`,
        "Rewrite your resume bullets so each one leads with a metric.",
        "Apply your optimized resume to five target roles and track responses.",
      ],
    },
    {
      title: "Prove it with real work",
      timeframe: "3-6 months",
      focus: "Turn new skills into shippable, visible output.",
      milestones: [
        "Ship one portfolio project end to end and write it up.",
        `Get hands-on with ${focusSkills[1] ?? "a second priority skill"} in a realistic setting.`,
        "Collect a referral or recommendation from a recent collaborator.",
      ],
    },
    {
      title: "Operate at the target level",
      timeframe: "6-12 months",
      focus: `Take on the responsibilities a ${target} is expected to own.`,
      milestones: [
        "Lead a feature or initiative from design through delivery.",
        "Mentor a peer or contribute to a shared standard.",
        "Run mock interviews and tighten your system-design narrative.",
      ],
    },
  ];

  return { summary, steps };
}
