import { authenticator } from "otplib";

/** Generates a new TOTP secret for enrolling a user in 2FA. */
export function generateTotpSecret(): string {
  return authenticator.generateSecret();
}

/** Builds an otpauth:// URI suitable for QR-code rendering. */
export function buildTotpUri(email: string, secret: string): string {
  return authenticator.keyuri(email, "ResumeForge AI", secret);
}

/** Verifies a 6-digit TOTP code against the stored secret. */
export function verifyTotp(token: string, secret: string): boolean {
  return authenticator.verify({ token, secret });
}
