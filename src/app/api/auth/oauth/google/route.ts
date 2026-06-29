import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import { env } from "@/env";
import { buildGoogleAuthUrl, isGoogleConfigured } from "@/lib/auth/google";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GOOGLE_STATE_COOKIE = "g_oauth_state";
export const GOOGLE_NEXT_COOKIE = "g_oauth_next";

export async function GET(req: NextRequest) {
  // Feature stays dormant until the Google credentials are configured.
  if (!isGoogleConfigured()) {
    return NextResponse.redirect(new URL("/login?error=google_unavailable", env.APP_URL));
  }

  const state = randomBytes(24).toString("hex");
  const authUrl = buildGoogleAuthUrl(state);

  // Preserve an optional ?next= destination across the round-trip.
  const requestedNext = req.nextUrl.searchParams.get("next");
  const next = requestedNext && requestedNext.startsWith("/") ? requestedNext : "/dashboard";

  const res = NextResponse.redirect(authUrl);
  const secure = env.NODE_ENV === "production";
  res.cookies.set(GOOGLE_STATE_COOKIE, state, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  res.cookies.set(GOOGLE_NEXT_COOKIE, next, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
