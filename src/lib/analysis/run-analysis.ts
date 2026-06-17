import { prisma } from "@/lib/prisma";
import { complete, parseJson } from "@/lib/ai";
import { resumeAnalysisPrompt } from "@/lib/ai/prompts";
import { logger } from "@/lib/logger";
import { analyzeResumeLocally, type ResumeAnalysisResult } from "@/lib/analysis/local-engine";
import type { AiProvider } from "@prisma/client";

/**
 * Runs a resume analysis end to end and persists the result.
 * Prefers a configured AI provider; on any failure (including no API key set)
 * it falls back to the deterministic local engine so the feature always works.
 */
export async function runResumeAnalysis(args: {
  analysisId: string;
  resumeId: string;
  userId: string;
  targetRole?: string;
}): Promise<void> {
  const { analysisId, resumeId, userId, targetRole } = args;

  await prisma.resumeAnalysis.update({
    where: { id: analysisId },
    data: { status: "PROCESSING" },
  });

  const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
  if (!resume) throw new Error(`Resume ${resumeId} not found`);

  let result: ResumeAnalysisResult;
  let provider: AiProvider | null = null;

  try {
    const ai = await complete({
      messages: resumeAnalysisPrompt(resume.rawText, targetRole),
      json: true,
      operation: "resume_analysis",
      userId,
    });
    const parsed = parseJson<ResumeAnalysisResult>(ai.text);
    if (!parsed) throw new Error("AI returned malformed analysis JSON");
    result = parsed;
    provider = ai.provider;
  } catch (err) {
    logger.info("Using local analysis engine", { reason: String(err) });
    result = analyzeResumeLocally(resume.rawText, targetRole);
  }

  await prisma.resumeAnalysis.update({
    where: { id: analysisId },
    data: {
      status: "COMPLETED",
      overallScore: result.overallScore,
      atsScore: result.atsScore,
      formattingScore: result.formattingScore,
      readabilityScore: result.readabilityScore,
      keywordScore: result.keywordScore,
      sectionScores: result.sectionScores,
      recommendations: result.recommendations,
      missingSkills: result.missingSkills,
      provider,
      completedAt: new Date(),
    },
  });
}
