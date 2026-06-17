import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit";
import { complete, parseJson } from "@/lib/ai";
import { jobMatchPrompt } from "@/lib/ai/prompts";
import { jobMatchLocally, type JobMatchResult } from "@/lib/analysis/local-engine";
import { toErrorResponse } from "@/lib/errors";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  resumeText: z.string().min(30, "Paste your resume text (at least a few lines)"),
  jobText: z.string().min(30, "Paste the job description (at least a few lines)"),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    await rateLimit(`match:${user.id}`, { max: 30, windowSeconds: 60 });
    const { resumeText, jobText } = bodySchema.parse(await req.json());

    let result: JobMatchResult;
    try {
      const ai = await complete({
        messages: jobMatchPrompt(resumeText, jobText),
        json: true,
        operation: "job_match",
        userId: user.id,
      });
      const parsed = parseJson<JobMatchResult>(ai.text);
      if (!parsed) throw new Error("malformed AI response");
      result = parsed;
    } catch {
      result = jobMatchLocally(resumeText, jobText);
    }

    return NextResponse.json({ match: result }, { status: 200 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
