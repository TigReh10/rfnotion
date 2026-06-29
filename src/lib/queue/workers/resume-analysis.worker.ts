import { Worker } from "bullmq";
import { queueConnection, QUEUE_NAMES, type ResumeAnalysisJob } from "@/lib/queue";
import { prisma } from "@/lib/prisma";
import { runResumeAnalysis } from "@/lib/analysis/run-analysis";
import { logger } from "@/lib/logger";

export function startResumeAnalysisWorker(): Worker<ResumeAnalysisJob> {
  const worker = new Worker<ResumeAnalysisJob>(
    QUEUE_NAMES.resumeAnalysis,
    async (job) => {
      const { analysisId, resumeId, userId, targetRole } = job.data;
      // Delegate to the shared analysis runner, which prefers a configured AI
      // provider and transparently falls back to the deterministic local
      // engine, so the queued path works with or without API keys.
      await runResumeAnalysis({ analysisId, resumeId, userId, targetRole });
      logger.info("Resume analysis completed", { analysisId });
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
