import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit";
import { runResumeAnalysis } from "@/lib/analysis/run-analysis";
import { currentPeriodKey } from "@/lib/utils";
import { toErrorResponse, NotFoundError, QuotaExceededError } from "@/lib/errors";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  resumeId: z.string().min(1),
  targetRole: z.string().max(160).optional(),
});

const FREE_MONTHLY_ANALYSES = 5;

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    await rateLimit(`analyze:${user.id}`, { max: 20, windowSeconds: 60 });

    const { resumeId, targetRole } = bodySchema.parse(await req.json());

    const resume = await prisma.resume.findFirst({ where: { id: resumeId, userId: user.id } });
    if (!resume) throw new NotFoundError("Resume not found");

    // Enforce monthly quota based on plan (defaults to free tier).
    const period = currentPeriodKey();
    const sub = await prisma.subscription.findUnique({
      where: { userId: user.id },
      include: { plan: true },
    });
    const monthlyLimit = sub?.plan.monthlyAnalyses ?? FREE_MONTHLY_ANALYSES;
    const used = await prisma.usageRecord.count({
      where: { userId: user.id, metric: "resume_analysis", period },
    });
    if (used >= monthlyLimit) {
      throw new QuotaExceededError(`Monthly analysis limit (${monthlyLimit}) reached`);
    }

    const analysis = await prisma.resumeAnalysis.create({
      data: { resumeId, status: "PENDING" },
    });
    await prisma.usageRecord.create({
      data: { userId: user.id, metric: "resume_analysis", period },
    });

    // Run inline so the product works without a separate worker process.
    // runResumeAnalysis prefers a configured AI provider and falls back to the
    // deterministic local engine, so this never depends on external keys.
    await runResumeAnalysis({ analysisId: analysis.id, resumeId, userId: user.id, targetRole });

    const completed = await prisma.resumeAnalysis.findUnique({ where: { id: analysis.id } });
    return NextResponse.json({ analysis: completed }, { status: 200 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
