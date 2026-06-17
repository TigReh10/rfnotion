import { Worker } from "bullmq";
import { queueConnection, QUEUE_NAMES, type ResumeAnalysisJob } from "@/lib/queue";
import { prisma } from "@/lib/prisma";
import { complete, parseJson } from "@/lib/ai";
import { resumeAnalysisPrompt } from "@/lib/ai/prompts";
import { logger } from "@/lib/logger";

interface AnalysisJson {
  overallScore: number;
  atsScore: number;
  formattingScore: number;
  readabilityScore: number;
  keywordScore: number;
  sectionScores: Record<string, number>;
  missingSkills: string[];
  recommendations: { title: string; detail: string; severity: string }[];
}

export function startResumeAnalysisWorker(): Worker<ResumeAnalysisJob> {
  const worker = new Worker<ResumeAnalysisJob>(
    QUEUE_NAMES.resumeAnalysis,
    async (job) => {
      const { analysisId, resumeId, userId, targetRole } = job.data;
      await prisma.resumeAnalysis.update({
        where: { id: analysisId },
        data: { status: "PROCESSING" },
      });

      const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
      if (!resume) throw new Error(`Resume ${resumeId} not found`);

      const result = await complete({
        messages: resumeAnalysisPrompt(resume.rawText, targetRole),
        json: true,
        operation: "resume_analysis",
        userId,
      });

      const parsed = parseJson<AnalysisJson>(result.text);
      if (!parsed) throw new Error("AI returned malformed analysis JSON");

      await prisma.resumeAnalysis.update({
        where: { id: analysisId },
        data: {
          status: "COMPLETED",
          overallScore: parsed.overallScore,
          atsScore: parsed.atsScore,
          formattingScore: parsed.formattingScore,
          readabilityScore: parsed.readabilityScore,
          keywordScore: parsed.keywordScore,
          sectionScores: parsed.sectionScores,
          recommendations: parsed.recommendations,
          missingSkills: parsed.missingSkills,
          provider: result.provider,
          completedAt: new Date(),
        },
      });
      logger.info("Resume analysis completed", { analysisId, provider: result.provider });
    },
    { connection: queueConnection, concurrency: 5 },
  );

  worker.on("failed", async (job, err) => {
    logger.error("Resume analysis failed", { jobId: job?.id, error: err.message });
    if (job?.data.analysisId) {
      await prisma.resumeAnalysis.update({
        where: { id: job.data.analysisId },
        data: { status: "FAILED", error: err.message },
      }).catch(() => undefined);
    }
  });

  return worker;
}
