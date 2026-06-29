import { env } from "@/env";

/**
 * Minimal, dependency-free Google OAuth 2.0 helper used by the sign-in routes.
 *
 * Everything here is gated behind isGoogleConfigured(), so the feature stays
 * completely dormant until the three GOOGLE_* environment variables are set.
 * That means the app builds and runs exactly as before until you add the keys.
 */

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

/** True only when all three Google credentials are present. */
export function isGoogleConfigured(): boolean {
  return Boolean(
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REDIRECT_URI,
  );
}

export interface GoogleProfile {
  sub: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  picture?: string;
}

/** Builds the Google consent-screen URL to redirect the user to. */
export function buildGoogleAuthUrl(state: string): string {
  if (!isGoogleConfigured()) throw new Error("Google sign-in is not configured");
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID!,
    redirect_uri: env.GOOGLE_REDIRECT_URI!,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    include_granted_scopes: "true",
    prompt: "select_account",
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/** Exchanges an authorization code for Google access/refresh tokens. */
export async function exchangeGoogleCode(code: string): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}> {
  if (!isGoogleConfigured()) throw new Error("Google sign-in is not configured");
  const body = new URLSearchParams({
    code,
    client_id: env.GOOGLE_CLIENT_ID!,
    client_secret: env.GOOGLE_CLIENT_SECRET!,
    redirect_uri: env.GOOGLE_REDIRECT_URI!,
    grant_type: "authorization_code",
  });
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    throw new Error(`Google token exchange failed (${res.status})`);
  }
  const json = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresIn: json.expires_in,
  };
}

/** Loads the signed-in Google user's profile via the OpenID userinfo endpoint. */
export async function fetchGoogleProfile(accessToken: string): Promise<GoogleProfile> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Failed to load Google profile (${res.status})`);
  const json = (await res.json()) as {
    sub: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
  };
  if (!json.email) throw new Error("Google account did not return an email address");
  return {
    sub: json.sub,
    email: json.email.toLowerCase(),
    emailVerified: Boolean(json.email_verified),
    name: json.name,
    picture: json.picture,
  };
}
