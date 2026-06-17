import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit";
import { complete, parseJson } from "@/lib/ai";
import { interviewPrepPrompt } from "@/lib/ai/prompts";
import { interviewPrepLocally, type InterviewPrepResult } from "@/lib/analysis/local-engine";
import { toErrorResponse } from "@/lib/errors";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  resumeText: z.string().min(30, "Paste your resume text (at least a few lines)"),
  jobText: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    await rateLimit(`interview:${user.id}`, { max: 20, windowSeconds: 60 });
    const { resumeText, jobText } = bodySchema.parse(await req.json());
    const job = jobText && jobText.trim().length > 0 ? jobText.trim() : undefined;

    let result: InterviewPrepResult;
    try {
      const ai = await complete({
        messages: interviewPrepPrompt(resumeText, job),
        json: true,
        operation: "interview_prep",
        userId: user.id,
      });
      const parsed = parseJson<InterviewPrepResult>(ai.text);
      if (!parsed || !Array.isArray(parsed.behavioral) || !Array.isArray(parsed.technical)) {
        throw new Error("malformed AI response");
      }
      result = parsed;
    } catch {
      result = interviewPrepLocally(resumeText, job);
    }

    await prisma.interviewPrep.create({
      data: {
        userId: user.id,
        behavioral: result.behavioral,
        technical: result.technical,
        followUps: result.followUps,
      },
    });

    return NextResponse.json({ prep: result }, { status: 200 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
