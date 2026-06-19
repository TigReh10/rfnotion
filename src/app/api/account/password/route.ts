import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { rateLimit } from "@/lib/rate-limit";
import { AppError, toErrorResponse } from "@/lib/errors";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: z.string().min(8, "New password must be at least 8 characters").max(128),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    await rateLimit(`account-password:${user.id}`, { max: 10, windowSeconds: 600 });

    const { currentPassword, newPassword } = bodySchema.parse(await req.json());

    const record = await prisma.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true },
    });
    if (!record?.passwordHash) {
      throw new AppError(
        "Password changes are not available for social-login accounts.",
        400,
        "NO_PASSWORD",
      );
    }

    const ok = await verifyPassword(currentPassword, record.passwordHash);
    if (!ok) throw new AppError("Your current password is incorrect.", 400, "BAD_PASSWORD");

    if (await verifyPassword(newPassword, record.passwordHash)) {
      throw new AppError("Choose a password different from your current one.", 400, "SAME_PASSWORD");
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
