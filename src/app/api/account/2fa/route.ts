import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { generateTotpSecret, buildTotpUri, verifyTotp } from "@/lib/auth/totp";
import { rateLimit } from "@/lib/rate-limit";
import { AppError, toErrorResponse } from "@/lib/errors";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  action: z.enum(["setup", "enable", "disable"]),
  token: z.string().trim().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    await rateLimit(`account-2fa:${user.id}`, { max: 20, windowSeconds: 600 });

    const { action, token } = bodySchema.parse(await req.json());

    if (action === "setup") {
      const secret = generateTotpSecret();
      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorSecret: secret, twoFactorEnabled: false },
      });
      return NextResponse.json({
        secret,
        otpauthUri: buildTotpUri(user.email, secret),
      });
    }

    const record = await prisma.user.findUnique({
      where: { id: user.id },
      select: { twoFactorSecret: true, twoFactorEnabled: true },
    });

    if (action === "enable") {
      if (!record?.twoFactorSecret) {
        throw new AppError("Start two-factor setup first.", 400, "NO_2FA_SECRET");
      }
      if (!token || !verifyTotp(token, record.twoFactorSecret)) {
        throw new AppError("That code is invalid or expired. Try again.", 400, "BAD_2FA_CODE");
      }
      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorEnabled: true },
      });
      return NextResponse.json({ ok: true, enabled: true });
    }

    // action === "disable"
    if (!record?.twoFactorEnabled) {
      return NextResponse.json({ ok: true, enabled: false });
    }
    if (!token || !record.twoFactorSecret || !verifyTotp(token, record.twoFactorSecret)) {
      throw new AppError("Enter a valid code to turn off two-factor.", 400, "BAD_2FA_CODE");
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    });
    return NextResponse.json({ ok: true, enabled: false });
  } catch (err) {
    return toErrorResponse(err);
  }
}
