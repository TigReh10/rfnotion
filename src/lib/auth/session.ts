import { cookies } from "next/headers";
import { randomBytes, createHash } from "node:crypto";
import { env } from "@/env";
import { prisma } from "@/lib/prisma";
import { signAccessToken, verifyAccessToken } from "@/lib/auth/jwt";
import { UnauthorizedError } from "@/lib/errors";
import type { Role } from "@prisma/client";

export interface SessionUser {
  id: string;
  email: string;
  role: Role;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Issues an access cookie + a persisted refresh session row. */
export async function createSession(
  user: SessionUser,
  meta?: { userAgent?: string; ip?: string },
): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = await signAccessToken({ sub: user.id, email: user.email, role: user.role });
  const refreshToken = randomBytes(48).toString("hex");

  await prisma.session.create({
    data: {
      userId: user.id,
      refreshHash: hashToken(refreshToken),
      userAgent: meta?.userAgent,
      ip: meta?.ip,
      expiresAt: new Date(Date.now() + env.JWT_REFRESH_TTL * 1000),
    },
  });

  const jar = await cookies();
  jar.set(env.AUTH_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: env.JWT_ACCESS_TTL,
  });
  jar.set(`${env.AUTH_COOKIE_NAME}_rt`, refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: env.JWT_REFRESH_TTL,
  });

  return { accessToken, refreshToken };
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const rt = jar.get(`${env.AUTH_COOKIE_NAME}_rt`)?.value;
  if (rt) {
    await prisma.session.deleteMany({ where: { refreshHash: hashToken(rt) } });
  }
  jar.delete(env.AUTH_COOKIE_NAME);
  jar.delete(`${env.AUTH_COOKIE_NAME}_rt`);
}

/** Returns the authenticated user or null (does not throw). */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(env.AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const claims = await verifyAccessToken(token);
    return { id: claims.sub, email: claims.email, role: claims.role };
  } catch {
    return null;
  }
}

/** Returns the authenticated user or throws UnauthorizedError. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new UnauthorizedError("Admin access required");
  return user;
}
