import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { verifyTotp } from "@/lib/auth/totp";
import { createSession } from "@/lib/auth/session";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { toErrorResponse, UnauthorizedError } from "@/lib/errors";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  totp: z.string().length(6).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req.headers);
    await rateLimit(`login:${ip}`, { max: 10, windowSeconds: 300 });

    const { email, password, totp } = bodySchema.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) throw new UnauthorizedError("Invalid credentials");

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) throw new UnauthorizedError("Invalid credentials");

    if (user.twoFactorEnabled) {
      if (!totp) return NextResponse.json({ requires2fa: true }, { status: 200 });
      if (!user.twoFactorSecret || !verifyTotp(totp, user.twoFactorSecret)) {
        throw new UnauthorizedError("Invalid 2FA code");
      }
    }

    await prisma.auditLog.create({
      data: { userId: user.id, action: "LOGIN", ip, userAgent: req.headers.get("user-agent") },
    });

    await createSession(
      { id: user.id, email: user.email, role: user.role },
      { ip, userAgent: req.headers.get("user-agent") ?? undefined },
    );
    return NextResponse.json({
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}
