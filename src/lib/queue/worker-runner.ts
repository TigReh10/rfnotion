import { startResumeAnalysisWorker } from "@/lib/queue/workers/resume-analysis.worker";
import { logger } from "@/lib/logger";

/**
 * Standalone worker process entrypoint.
 * Run with: pnpm worker  (or `node` against the compiled output in prod).
 */
function main() {
  const workers = [startResumeAnalysisWorker()];
  logger.info("Workers started", { count: workers.length });

  const shutdown = async () => {
    logger.info("Shutting down workers...");
    await Promise.all(workers.map((w) => w.close()));
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

main();
