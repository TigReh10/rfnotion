import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit";
import { complete } from "@/lib/ai";
import { coverLetterPrompt } from "@/lib/ai/prompts";
import { coverLetterLocally } from "@/lib/analysis/local-engine";
import { toErrorResponse } from "@/lib/errors";

export const dynamic = "force-dynamic";

const TONES = ["PROFESSIONAL", "ENTHUSIASTIC", "CONCISE", "FORMAL", "CONVERSATIONAL"] as const;

const bodySchema = z.object({
  resumeText: z.string().min(30, "Paste your resume text (at least a few lines)"),
  jobText: z.string().min(30, "Paste the job description (at least a few lines)"),
  tone: z.enum(TONES).default("PROFESSIONAL"),
  company: z.string().max(120).optional(),
  role: z.string().max(120).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    await rateLimit(`cover:${user.id}`, { max: 20, windowSeconds: 60 });
    const { resumeText, jobText, tone, company, role } = bodySchema.parse(await req.json());

    let content: string;
    let provider: string | null = null;
    try {
      const ai = await complete({
        messages: coverLetterPrompt(resumeText, jobText, tone),
        operation: "cover_letter",
        userId: user.id,
      });
      content = ai.text.trim();
      if (content.length < 40) throw new Error("empty AI response");
      provider = ai.provider;
    } catch {
      content = coverLetterLocally({ resumeText, jobText, tone, company, role });
    }

    const saved = await prisma.coverLetter.create({
      data: { userId: user.id, tone, content },
    });

    return NextResponse.json({ id: saved.id, content, tone, provider }, { status: 200 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
