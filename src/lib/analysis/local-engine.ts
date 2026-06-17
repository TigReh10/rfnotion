/**
 * Deterministic, dependency-free analysis engine.
 *
 * Powers every ResumeForge feature with ZERO external API keys, so the product
 * is fully functional for launch/demo today. When OpenAI/Anthropic keys are
 * configured, higher-level callers prefer the AI provider and use this engine
 * only as a fallback. Output shapes match the AI JSON contracts exactly.
 */
import { tokenize, computeKeywordMatch } from "@/lib/analysis/job-match";

export interface Recommendation {
  title: string;
  detail: string;
  severity: "low" | "medium" | "high";
}

export interface ResumeAnalysisResult {
  overallScore: number;
  atsScore: number;
  formattingScore: number;
  readabilityScore: number;
  keywordScore: number;
  sectionScores: {
    contact: number;
    summary: number;
    experience: number;
    skills: number;
    education: number;
  };
  missingSkills: string[];
  recommendations: Recommendation[];
}

export interface JobMatchResult {
  matchScore: number;
  missingKeywords: string[];
  missingSkills: string[];
  suggestedEdits: { section: string; suggestion: string }[];
}

export interface InterviewPrepResult {
  behavioral: { question: string; answer: string }[];
  technical: { question: string; answer: string }[];
  followUps: string[];
}

const ACTION_VERBS = [
  "led", "built", "designed", "launched", "improved", "increased", "reduced",
  "created", "managed", "developed", "implemented", "optimized", "delivered",
  "drove", "architected", "shipped", "scaled", "automated", "mentored", "owned",
  "spearheaded", "streamlined", "achieved", "negotiated", "coordinated",
];

const COMMON_SKILLS = [
  "javascript", "typescript", "react", "node", "python", "java", "go", "rust",
  "sql", "nosql", "aws", "gcp", "azure", "docker", "kubernetes", "graphql",
  "rest", "git", "ci/cd", "postgresql", "mysql", "redis", "html", "css",
  "tailwind", "next.js", "express", "django", "kafka", "terraform",
  "communication", "leadership", "agile", "scrum", "testing",
];

const CORE_SKILLS = [
  "javascript", "typescript", "react", "node", "python", "sql", "aws",
  "docker", "git", "testing", "communication", "leadership",
];

const SECTION_HINTS: Record<string, string[]> = {
  summary: ["summary", "objective", "profile", "highlights"],
  experience: ["experience", "employment", "work history", "internship"],
  skills: ["skills", "technologies", "technical", "tools", "stack"],
  education: ["education", "university", "college", "bachelor", "master", "degree", "b.tech", "b.s"],
};

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function includesAny(haystack: string, terms: string[]): number {
  return terms.reduce((acc, t) => acc + (haystack.includes(t) ? 1 : 0), 0);
}

function hasEmail(text: string): boolean {
  return /[^\s@]+@[^\s@]+\.[^\s@]+/.test(text);
}

function hasPhone(text: string): boolean {
  return /(\+?\d[\d\s().-]{7,})/.test(text);
}

export function analyzeResumeLocally(
  resumeText: string,
  targetRole?: string,
): ResumeAnalysisResult {
  const text = resumeText || "";
  const lower = text.toLowerCase();
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const words = tokenize(text);
  const wordCount = words.length;
  const bulletCount = lines.filter((l) => /^[-*\u2022>]/.test(l)).length;
  const quantifiedCount = (text.match(/\d+%|\$\d+|\d{2,}/g) || []).length;
  const actionVerbHits = includesAny(lower, ACTION_VERBS);
  const skillsFound = COMMON_SKILLS.filter((s) => lower.includes(s));
  const roleWords = targetRole ? tokenize(targetRole) : [];
  const roleHits = roleWords.filter((w) => lower.includes(w)).length;

  const contact = clamp(
    (hasEmail(text) ? 45 : 0) +
      (hasPhone(text) ? 25 : 0) +
      (lower.includes("linkedin") ? 18 : 0) +
      (lower.includes("github") ? 12 : 0),
  );
  const summary = clamp(
    includesAny(lower, SECTION_HINTS.summary) > 0 ? 60 + Math.min(35, wordCount / 20) : 35,
  );
  const experience = clamp(
    (includesAny(lower, SECTION_HINTS.experience) > 0 ? 45 : 20) +
      Math.min(30, actionVerbHits * 5) +
      Math.min(25, quantifiedCount * 4),
  );
  const skills = clamp(
    (includesAny(lower, SECTION_HINTS.skills) > 0 ? 45 : 25) +
      Math.min(50, skillsFound.length * 6),
  );
  const education = clamp(includesAny(lower, SECTION_HINTS.education) > 0 ? 80 : 45);
  const sectionScores = { contact, summary, experience, skills, education };

  const keywordScore = clamp(
    Math.min(60, skillsFound.length * 7) + Math.min(40, roleHits * 12) + 10,
  );
  const idealLen = wordCount >= 250 && wordCount <= 850;
  const formattingScore = clamp(
    50 +
      (bulletCount >= 5 ? 20 : bulletCount * 3) +
      (idealLen ? 20 : -10) +
      (contact > 60 ? 10 : 0),
  );
  const avgLineLen = lines.length ? wordCount / lines.length : 0;
  const readabilityScore = clamp(
    60 + (bulletCount >= 5 ? 18 : 0) + (avgLineLen > 4 && avgLineLen < 22 ? 22 : -8),
  );
  const atsScore = clamp(
    keywordScore * 0.35 +
      formattingScore * 0.25 +
      contact * 0.15 +
      skills * 0.15 +
      experience * 0.1,
  );
  const overallScore = clamp(
    atsScore * 0.4 +
      keywordScore * 0.2 +
      experience * 0.2 +
      readabilityScore * 0.1 +
      formattingScore * 0.1,
  );

  const missingSkills = CORE_SKILLS.filter((s) => !lower.includes(s)).slice(0, 8);

  const recommendations: Recommendation[] = [];
  if (quantifiedCount < 3) {
    recommendations.push({
      title: "Quantify your impact",
      detail:
        "Add concrete metrics (%, $, time saved, users reached) to at least three bullet points. Both recruiters and ATS reward measurable outcomes.",
      severity: "high",
    });
  }
  if (actionVerbHits < 4) {
    recommendations.push({
      title: "Lead with strong action verbs",
      detail:
        'Start each bullet with verbs like "Built", "Led" or "Optimized" instead of passive phrasing such as "Responsible for".',
      severity: "medium",
    });
  }
  if (contact < 70) {
    recommendations.push({
      title: "Complete your contact header",
      detail:
        "Include a professional email, phone number, and LinkedIn/GitHub links at the very top so ATS parsers can read them.",
      severity: contact < 45 ? "high" : "medium",
    });
  }
  if (skillsFound.length < 6) {
    recommendations.push({
      title: "Expand your skills section",
      detail:
        "List the specific tools and technologies relevant to your target role. Few recognizable keywords currently appear.",
      severity: "medium",
    });
  }
  if (!idealLen) {
    recommendations.push({
      title: wordCount < 250 ? "Add more detail" : "Tighten your resume",
      detail:
        wordCount < 250
          ? "Your resume looks short. Expand on responsibilities and achievements to fill out a focused one-page resume."
          : "Your resume runs long. Trim older or less relevant content so it stays scannable.",
      severity: "low",
    });
  }
  if (targetRole && roleHits === 0) {
    recommendations.push({
      title: "Tailor toward your target role",
      detail:
        "None of the target role's keywords appear in your resume. Mirror the role's language wherever it is truthful to do so.",
      severity: "high",
    });
  }
  if (recommendations.length === 0) {
    recommendations.push({
      title: "Strong resume - keep iterating",
      detail:
        "Your resume covers the fundamentals well. Tailor it per application and refresh your metrics as you grow.",
      severity: "low",
    });
  }

  return {
    overallScore,
    atsScore,
    formattingScore,
    readabilityScore,
    keywordScore,
    sectionScores,
    missingSkills,
    recommendations,
  };
}

export function jobMatchLocally(resumeText: string, jobText: string): JobMatchResult {
  const km = computeKeywordMatch(resumeText, jobText);
  const lowerResume = (resumeText || "").toLowerCase();
  const lowerJob = (jobText || "").toLowerCase();
  const missingSkills = COMMON_SKILLS.filter(
    (s) => lowerJob.includes(s) && !lowerResume.includes(s),
  );
  const topMissing = km.missingKeywords.slice(0, 15);

  const suggestedEdits: { section: string; suggestion: string }[] = [];
  if (missingSkills.length) {
    suggestedEdits.push({
      section: "Skills",
      suggestion: `Add the required skills you genuinely have: ${missingSkills.slice(0, 8).join(", ")}.`,
    });
  }
  if (topMissing.length) {
    suggestedEdits.push({
      section: "Experience",
      suggestion: `Weave in keywords from the posting where truthful: ${topMissing.slice(0, 8).join(", ")}.`,
    });
  }
  suggestedEdits.push({
    section: "Summary",
    suggestion:
      "Open with a one-line summary mirroring the job title and your years of relevant experience.",
  });

  return {
    matchScore: km.matchScore,
    missingKeywords: topMissing,
    missingSkills,
    suggestedEdits,
  };
}

function guessName(resumeText: string): string | undefined {
  const first = (resumeText || "").split(/\r?\n/).map((l) => l.trim()).find(Boolean);
  if (!first || first.includes("@")) return undefined;
  const words = first.split(/\s+/);
  if (words.length <= 4 && /^[A-Za-z][A-Za-z.'-]+(\s+[A-Za-z][A-Za-z.'-]+)*$/.test(first)) {
    return first;
  }
  return undefined;
}

function guessRole(jobText: string): string | undefined {
  const first = (jobText || "").split(/\r?\n/).map((l) => l.trim()).find(Boolean);
  if (!first) return undefined;
  return first.length <= 80 ? first : undefined;
}

function toneOpener(tone: string): string {
  switch (tone.toUpperCase()) {
    case "ENTHUSIASTIC":
      return "I was thrilled to come across";
    case "FORMAL":
      return "I am writing to formally express my interest in";
    case "CONCISE":
      return "I am applying for";
    case "CONVERSATIONAL":
      return "I would love to throw my hat in the ring for";
    default:
      return "I am excited to apply for";
  }
}

function achievementLine(resumeText: string): string {
  const lines = (resumeText || "").split(/\r?\n/).map((l) => l.trim());
  const quantified = lines.find((l) => /\d/.test(l) && l.length > 20 && l.length < 160);
  if (quantified) return quantified.replace(/^[-*\u2022>\s]+/, "").replace(/\.$/, "");
  return "delivered measurable results by shipping reliable software and collaborating across teams";
}

export function coverLetterLocally(opts: {
  resumeText: string;
  jobText: string;
  tone: string;
  company?: string;
  role?: string;
}): string {
  const name = guessName(opts.resumeText) || "Your Name";
  const company = opts.company || "your company";
  const role = opts.role || guessRole(opts.jobText) || "this role";
  const lowerResume = opts.resumeText.toLowerCase();
  const lowerJob = opts.jobText.toLowerCase();
  const shared = COMMON_SKILLS.filter((s) => lowerResume.includes(s) && lowerJob.includes(s));
  const fallback = COMMON_SKILLS.filter((s) => lowerResume.includes(s));
  const topSkills = (shared.length ? shared : fallback).slice(0, 4);
  const skillsPhrase = topSkills.length ? topSkills.join(", ") : "the core skills this role requires";
  const opener = toneOpener(opts.tone);

  const paragraphs = [
    "Dear Hiring Manager,",
    `${opener} the ${role} position at ${company}. With a background spanning ${skillsPhrase}, I am confident I can make an immediate contribution to your team.`,
    `In my recent work I ${achievementLine(opts.resumeText)}. I pair technical execution with clear communication, and I am drawn to ${company} because of the impact this role promises.`,
    `I would welcome the chance to discuss how my experience with ${skillsPhrase} maps to your needs. Thank you for your time and consideration.`,
    `Sincerely,\n${name}`,
  ];
  return paragraphs.join("\n\n");
}

export function interviewPrepLocally(resumeText: string, jobText?: string): InterviewPrepResult {
  const lower = (resumeText + " " + (jobText || "")).toLowerCase();
  const skills = COMMON_SKILLS.filter((s) => lower.includes(s));
  const focus = (skills.length ? skills : ["your core stack"]).slice(0, 5);

  const technical = focus.map((s) => ({
    question: `Walk me through a challenging problem you solved using ${s}.`,
    answer: `Use the STAR method: set up the Situation and Task, detail the specific actions you took with ${s}, then close with a measurable Result. Call out the trade-offs you weighed.`,
  }));

  const behavioral = [
    {
      question: "Tell me about a time you handled a tight deadline.",
      answer: "Describe how you triaged scope, communicated early, and what concrete outcome you delivered on time.",
    },
    {
      question: "Describe a conflict with a teammate and how you resolved it.",
      answer: "Show empathy and ownership: explain the disagreement, how you sought common ground, and the result.",
    },
    {
      question: "What is a project you are most proud of, and why?",
      answer: "Pick something with measurable impact; explain your specific role and what you learned.",
    },
  ];

  const followUps = [
    "What would you do differently if you started this project again?",
    "How did you measure success?",
    "Who did you collaborate with, and how did you align?",
  ];

  return { behavioral, technical, followUps };
}
