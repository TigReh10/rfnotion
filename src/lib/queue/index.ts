import { Queue } from "bullmq";
import IORedis from "ioredis";
import { env } from "@/env";

/** Dedicated connection for queue producers (separate from app cache). */
export const queueConnection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const QUEUE_NAMES = {
  resumeAnalysis: "resume-analysis",
  jobMatch: "job-match",
  email: "email",
} as const;

export interface ResumeAnalysisJob {
  analysisId: string;
  resumeId: string;
  userId: string;
  targetRole?: string;
}

export const resumeAnalysisQueue = new Queue<ResumeAnalysisJob>(QUEUE_NAMES.resumeAnalysis, {
  connection: queueConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
});

export async function enqueueResumeAnalysis(job: ResumeAnalysisJob): Promise<void> {
  await resumeAnalysisQueue.add("analyze", job);
}
