import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit";
import { complete, parseJson } from "@/lib/ai";
import { skillGapPrompt } from "@/lib/ai/prompts";
import { skillGapLocally, type SkillGapResult } from "@/lib/analysis/advanced";
import { toErrorResponse } from "@/lib/errors";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  resumeText: z.string().min(30, "Paste your resume text (at least a few lines)"),
  targetRole: z.string().min(2, "Enter a target role").max(160),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    await rateLimit(`skills:${user.id}`, { max: 30, windowSeconds: 60 });
    const { resumeText, targetRole } = bodySchema.parse(await req.json());

    let result: SkillGapResult;
    let provider: string | null = null;
    try {
      const ai = await complete({
        messages: skillGapPrompt(resumeText, targetRole),
        json: true,
        operation: "skill_gap",
        userId: user.id,
      });
      const parsed = parseJson<SkillGapResult>(ai.text);
      if (
        !parsed ||
        !Array.isArray(parsed.missingSkills) ||
        !Array.isArray(parsed.presentSkills) ||
        typeof parsed.readinessScore !== "number"
      ) {
        throw new Error("malformed AI response");
      }
      result = parsed;
      provider = ai.provider;
    } catch {
      result = skillGapLocally({ resumeText, targetRole });
    }

    return NextResponse.json({ result, provider }, { status: 200 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
