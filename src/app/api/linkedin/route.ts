import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit";
import { complete, parseJson } from "@/lib/ai";
import { linkedInPrompt } from "@/lib/ai/prompts";
import { linkedInLocally, type LinkedInResult } from "@/lib/analysis/advanced";
import { toErrorResponse } from "@/lib/errors";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  resumeText: z.string().min(30, "Paste your resume text (at least a few lines)"),
  targetRole: z.string().max(160).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    await rateLimit(`linkedin:${user.id}`, { max: 20, windowSeconds: 60 });
    const { resumeText, targetRole } = bodySchema.parse(await req.json());

    let result: LinkedInResult;
    let provider: string | null = null;
    try {
      const ai = await complete({
        messages: linkedInPrompt(resumeText, targetRole),
        json: true,
        operation: "linkedin_optimize",
        userId: user.id,
      });
      const parsed = parseJson<LinkedInResult>(ai.text);
      if (!parsed || !parsed.headline || !Array.isArray(parsed.suggestions)) {
        throw new Error("malformed AI response");
      }
      result = parsed;
      provider = ai.provider;
    } catch {
      result = linkedInLocally({ resumeText, targetRole });
    }

    const saved = await prisma.linkedInOptimization.create({
      data: {
        userId: user.id,
        headline: result.headline,
        about: result.about,
        suggestions: result.suggestions,
      },
    });

    return NextResponse.json({ id: saved.id, ...result, provider }, { status: 200 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
