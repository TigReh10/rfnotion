import { authenticator } from "otplib";

// otplib defaults to a verification window of 0, meaning a code is only valid
// for the exact 30-second step it was generated in. Real devices drift by a
// few seconds, which causes spurious "Invalid 2FA code" errors. Accepting the
// immediately adjacent steps (+/-1) is the widely-used, secure default.
authenticator.options = { window: 1 };

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
