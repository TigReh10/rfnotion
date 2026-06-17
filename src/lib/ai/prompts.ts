import type { AiMessage } from "@/lib/ai/types";

/** Resume analysis prompt: returns strict JSON scoring contract. */
export function resumeAnalysisPrompt(resumeText: string, targetRole?: string): AiMessage[] {
  return [
    {
      role: "system",
      content:
        "You are an expert ATS (Applicant Tracking System) analyst and senior technical recruiter. " +
        "Evaluate resumes objectively and return ONLY valid JSON matching this TypeScript type: " +
        "{ overallScore: number(0-100), atsScore: number, formattingScore: number, readabilityScore: number, " +
        "keywordScore: number, sectionScores: { contact:number, summary:number, experience:number, skills:number, education:number }, " +
        "missingSkills: string[], recommendations: { title:string, detail:string, severity:'low'|'medium'|'high' }[] }.",
    },
    {
      role: "user",
      content:
        (targetRole ? `Target role: ${targetRole}\n\n` : "") +
        `Analyze this resume and return the JSON object only:\n\n${resumeText}`,
    },
  ];
}

/** Job-match prompt comparing a resume against a job description. */
export function jobMatchPrompt(resumeText: string, jobText: string): AiMessage[] {
  return [
    {
      role: "system",
      content:
        "You are a recruiting assistant. Compare a resume to a job description and return ONLY valid JSON: " +
        "{ matchScore: number(0-100), missingKeywords: string[], missingSkills: string[], " +
        "suggestedEdits: { section:string, suggestion:string }[] }.",
    },
    { role: "user", content: `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobText}` },
  ];
}

/** Cover-letter generation prompt. */
export function coverLetterPrompt(
  resumeText: string,
  jobText: string,
  tone: string,
): AiMessage[] {
  return [
    {
      role: "system",
      content: `You write compelling, tailored cover letters in a ${tone.toLowerCase()} tone. Avoid clich\u00e9s and keep it under 350 words.`,
    },
    { role: "user", content: `Write a cover letter.\n\nRESUME:\n${resumeText}\n\nJOB:\n${jobText}` },
  ];
}

/** Interview question generation prompt. */
export function interviewPrepPrompt(resumeText: string, jobText?: string): AiMessage[] {
  return [
    {
      role: "system",
      content:
        "Generate interview questions and model answers. Return ONLY valid JSON: " +
        "{ behavioral: {question:string, answer:string}[], technical: {question:string, answer:string}[], " +
        "followUps: string[] }.",
    },
    {
      role: "user",
      content: `RESUME:\n${resumeText}` + (jobText ? `\n\nJOB:\n${jobText}` : ""),
    },
  ];
}
