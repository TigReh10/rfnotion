import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/env";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth/session";
import { clientIp } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import {
  exchangeGoogleCode,
  fetchGoogleProfile,
  isGoogleConfigured,
} from "@/lib/auth/google";
import { GOOGLE_NEXT_COOKIE, GOOGLE_STATE_COOKIE } from "../route";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function loginError(code: string): NextResponse {
  return NextResponse.redirect(new URL(`/login?error=${code}`, env.APP_URL));
}

export async function GET(req: NextRequest) {
  if (!isGoogleConfigured()) return loginError("google_unavailable");

  const url = req.nextUrl;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");
  const stateCookie = req.cookies.get(GOOGLE_STATE_COOKIE)?.value;
  const nextCookie = req.cookies.get(GOOGLE_NEXT_COOKIE)?.value;
  const next = nextCookie && nextCookie.startsWith("/") ? nextCookie : "/dashboard";

  // User declined the consent screen, or Google returned an error.
  if (oauthError) return loginError("google_cancelled");

  // CSRF protection: the state from Google must match our signed cookie.
  if (!code || !state || !stateCookie || state !== stateCookie) {
    return loginError("google_state");
  }

  try {
    const { accessToken, refreshToken, expiresIn } = await exchangeGoogleCode(code);
    const profile = await fetchGoogleProfile(accessToken);

    let user = await prisma.user.findUnique({
      where: { email: profile.email },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          avatarUrl: profile.picture,
          provider: "GOOGLE",
          emailVerified: profile.emailVerified ? new Date() : null,
        },
        select: { id: true, email: true, role: true },
      });
    }

    // Link (or refresh) the Google account record for this user.
    const expiresAt = expiresIn ? Math.floor(Date.now() / 1000) + expiresIn : null;
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: { provider: "google", providerAccountId: profile.sub },
      },
      create: {
        userId: user.id,
        provider: "google",
        providerAccountId: profile.sub,
        accessToken,
        refreshToken,
        expiresAt,
      },
      update: { accessToken, refreshToken, expiresAt },
    });

    const ip = clientIp(req.headers);
    await prisma.auditLog
      .create({
        data: {
          userId: user.id,
          action: "LOGIN",
          ip,
          userAgent: req.headers.get("user-agent"),
          metadata: { method: "google" },
        },
      })
      .catch(() => undefined);

    await createSession(user, {
      ip,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    const res = NextResponse.redirect(new URL(next, env.APP_URL));
    // The single-use state/next cookies have served their purpose.
    res.cookies.delete(GOOGLE_STATE_COOKIE);
    res.cookies.delete(GOOGLE_NEXT_COOKIE);
    return res;
  } catch (err) {
    logger.error("Google OAuth callback failed", { error: String(err) });
    return loginError("google_failed");
  }
}
