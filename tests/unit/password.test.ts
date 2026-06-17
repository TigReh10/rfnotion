import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("password hashing", () => {
  it("hashes and verifies a correct password", async () => {
    const hash = await hashPassword("superSecret1");
    expect(hash).toMatch(/^[0-9a-f]+:[0-9a-f]+$/);
    expect(await verifyPassword("superSecret1", hash)).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("superSecret1");
    expect(await verifyPassword("wrongPassword", hash)).toBe(false);
  });

  it("rejects passwords shorter than 8 chars", async () => {
    await expect(hashPassword("short")).rejects.toThrow();
  });

  it("returns false for malformed stored hashes", async () => {
    expect(await verifyPassword("whatever", "notvalid")).toBe(false);
  });
});
