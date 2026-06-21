import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { toErrorResponse, AppError } from "@/lib/errors";
import { isDisposableEmail } from "@/lib/auth/disposable-email";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  email: z
    .string()
    .email()
    .max(254)
    .transform((v) => v.trim().toLowerCase()),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(120).optional(),
  // Honeypot: must be empty. Real users never see this field.
  website: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req.headers);
    await rateLimit(`register:${ip}`, { max: 10, windowSeconds: 600 });

    const { email, password, name, website } = bodySchema.parse(await req.json());

    // Bot detected: the hidden honeypot field was filled in.
    if (website && website.trim().length > 0) {
      await prisma.auditLog
        .create({ data: { action: "REGISTER_SPAM_BLOCKED", ip, userAgent: req.headers.get("user-agent") } })
        .catch(() => undefined);
      throw new AppError("Could not create account", 400, "SPAM_DETECTED");
    }

    if (isDisposableEmail(email)) {
      throw new AppError(
        "Please use a permanent email address. Temporary or disposable email providers are not allowed.",
        422,
        "DISPOSABLE_EMAIL",
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError("An account with this email already exists", 409, "EMAIL_TAKEN");

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, name, passwordHash, provider: "CREDENTIALS" },
      select: { id: true, email: true, role: true },
    });

    await prisma.auditLog.create({
      data: { userId: user.id, action: "REGISTER", ip, userAgent: req.headers.get("user-agent") },
    });

    await createSession(user, { ip, userAgent: req.headers.get("user-agent") ?? undefined });
    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
