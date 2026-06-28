import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { env } from "@/env";

const secret = new TextEncoder().encode(env.JWT_SECRET);

export interface AccessTokenClaims extends JWTPayload {
  sub: string;
  email: string;
  role: "USER" | "ADMIN";
}

export async function signAccessToken(claims: Omit<AccessTokenClaims, "iat" | "exp">): Promise<string> {
  return new SignJWT({ email: claims.email, role: claims.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(`${env.JWT_ACCESS_TTL}s`)
    .sign(secret);
}

export async function verifyAccessToken(token: string): Promise<AccessTokenClaims> {
  // Pin the accepted algorithm. Without this, jwtVerify would accept any
  // algorithm the key happens to satisfy, opening the door to algorithm
  // confusion attacks.
  const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
  return payload as AccessTokenClaims;
}
