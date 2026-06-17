import { redis } from "@/lib/redis";
import { env } from "@/env";
import { RateLimitError } from "@/lib/errors";

/**
 * Fixed-window rate limiter backed by Redis.
 * Returns remaining quota; throws RateLimitError when exceeded.
 */
export async function rateLimit(
  identifier: string,
  opts?: { max?: number; windowSeconds?: number },
): Promise<{ remaining: number; limit: number; resetSeconds: number }> {
  const max = opts?.max ?? env.RATE_LIMIT_MAX;
  const windowSeconds = opts?.windowSeconds ?? env.RATE_LIMIT_WINDOW_SECONDS;
  const window = Math.floor(Date.now() / 1000 / windowSeconds);
  const key = `ratelimit:${identifier}:${window}`;

  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, windowSeconds);

  const remaining = Math.max(0, max - count);
  if (count > max) {
    throw new RateLimitError(`Rate limit exceeded. Try again in ${windowSeconds}s.`);
  }
  return { remaining, limit: max, resetSeconds: windowSeconds };
}

export function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
