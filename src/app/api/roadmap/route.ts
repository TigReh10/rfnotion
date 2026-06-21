import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit";
import { complete, parseJson } from "@/lib/ai";
import { careerRoadmapPrompt } from "@/lib/ai/prompts";
import { careerRoadmapLocally, type CareerRoadmapResult } from "@/lib/analysis/advanced";
import { toErrorResponse } from "@/lib/errors";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  targetRole: z.string().min(2, "Enter a target role").max(160),
  currentRole: z.string().max(160).optional(),
  resumeText: z.string().max(20000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    await rateLimit(`roadmap:${user.id}`, { max: 30, windowSeconds: 60 });
    const { targetRole, currentRole, resumeText } = bodySchema.parse(await req.json());

    let result: CareerRoadmapResult;
    let provider: string | null = null;
    try {
      const ai = await complete({
        messages: careerRoadmapPrompt(targetRole, currentRole, resumeText),
        json: true,
        operation: "career_roadmap",
        userId: user.id,
      });
      const parsed = parseJson<CareerRoadmapResult>(ai.text);
      if (!parsed || !parsed.summary || !Array.isArray(parsed.steps) || parsed.steps.length === 0) {
        throw new Error("malformed AI response");
      }
      result = parsed;
      provider = ai.provider;
    } catch {
      result = careerRoadmapLocally({ targetRole, currentRole, resumeText });
    }

    return NextResponse.json({ result, provider }, { status: 200 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
