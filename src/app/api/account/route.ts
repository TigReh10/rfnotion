import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser, destroySession } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { rateLimit } from "@/lib/rate-limit";
import { AppError, toErrorResponse } from "@/lib/errors";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  password: z.string().optional(),
});

/**
 * Permanently deletes the signed-in user and all related data. Every user
 * relation in the schema is onDelete: Cascade (audit logs are anonymized via
 * SetNull), so a single delete satisfies the GDPR "right to erasure".
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await requireUser();
    await rateLimit(`account-delete:${user.id}`, { max: 5, windowSeconds: 600 });

    const body = await req.json().catch(() => ({}));
    const { password } = bodySchema.parse(body);

    const record = await prisma.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true },
    });

    if (record?.passwordHash) {
      if (!password || !(await verifyPassword(password, record.passwordHash))) {
        throw new AppError("Your password is incorrect.", 400, "BAD_PASSWORD");
      }
    }

    await prisma.user.delete({ where: { id: user.id } });
    await destroySession();

    return NextResponse.json({ ok: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
