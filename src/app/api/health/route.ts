import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

/** Liveness + dependency readiness probe for load balancers / k8s. */
export async function GET() {
  const checks: Record<string, "ok" | "down"> = { db: "down", redis: "down" };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.db = "ok";
  } catch {
    checks.db = "down";
  }

  try {
    await redis.ping();
    checks.redis = "ok";
  } catch {
    checks.redis = "down";
  }

  const healthy = Object.values(checks).every((v) => v === "ok");
  return NextResponse.json(
    { status: healthy ? "healthy" : "degraded", checks, time: new Date().toISOString() },
    { status: healthy ? 200 : 503 },
  );
}
