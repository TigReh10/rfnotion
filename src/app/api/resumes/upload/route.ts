import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit";
import { extractResumeText, detectFileType } from "@/lib/resume/extract-text";
import { toErrorResponse, AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    await rateLimit(`upload:${user.id}`, { max: 30, windowSeconds: 60 });

    const form = await req.formData();
    const file = form.get("file");
    const pastedText = ((form.get("text") as string | null) ?? "").trim();
    const providedTitle = ((form.get("title") as string | null) ?? "").trim();

    let rawText = "";
    let title = providedTitle;

    if (file && typeof file !== "string") {
      if (file.size > MAX_BYTES) throw new AppError("File too large (max 5MB)");
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileType = detectFileType(file.name, file.type);
      rawText = await extractResumeText(buffer, fileType);
      if (!title) title = file.name.replace(/\.[^.]+$/, "");
    } else if (pastedText) {
      rawText = pastedText;
      if (!title) title = "Pasted resume";
    } else {
      throw new AppError("Provide a resume file or paste resume text");
    }

    rawText = rawText.trim();
    if (rawText.length < 30) {
      throw new AppError("Could not read enough text from that resume");
    }

    const resume = await prisma.resume.create({
      data: { userId: user.id, title: title || "Untitled resume", rawText },
    });

    return NextResponse.json(
      { resumeId: resume.id, title: resume.title, characters: rawText.length },
      { status: 201 },
    );
  } catch (err) {
    return toErrorResponse(err);
  }
}
