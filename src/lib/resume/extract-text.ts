import mammoth from "mammoth";
import type { ResumeFileType } from "@prisma/client";
import { AppError } from "@/lib/errors";

/**
 * Extracts plain text from an uploaded resume buffer.
 * Supports PDF, DOCX and TXT. PDF parsing is lazily imported to avoid
 * loading the parser in edge/runtime contexts that never call it.
 */
export async function extractResumeText(
  buffer: Buffer,
  fileType: ResumeFileType,
): Promise<string> {
  switch (fileType) {
    case "PDF": {
      // The pdf-parse package entry runs a debug block that reads a bundled
      // sample PDF when `module.parent` is falsy (which is the case under
      // bundlers), throwing ENOENT. Import the library implementation directly.
      // @ts-ignore - deep import has no bundled type declarations
      const mod = await import("pdf-parse/lib/pdf-parse.js");
      const pdfParse = (mod.default ?? mod) as (
        data: Buffer,
      ) => Promise<{ text: string }>;
      const data = await pdfParse(buffer);
      return normalize(data.text);
    }
    case "DOCX": {
      const { value } = await mammoth.extractRawText({ buffer });
      return normalize(value);
    }
    case "TXT":
      return normalize(buffer.toString("utf-8"));
    default:
      throw new AppError(`Unsupported file type: ${fileType}`);
  }
}

export function detectFileType(fileName: string, mime?: string): ResumeFileType {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf") || mime === "application/pdf") return "PDF";
  if (
    lower.endsWith(".docx") ||
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return "DOCX";
  if (lower.endsWith(".txt") || mime === "text/plain") return "TXT";
  throw new AppError("Only PDF, DOCX and TXT resumes are supported");
}

function normalize(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}
