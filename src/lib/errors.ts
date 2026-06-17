import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { logger } from "@/lib/logger";

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode = 400,
    public code = "BAD_REQUEST",
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message, 404, "NOT_FOUND");
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests") {
    super(message, 429, "RATE_LIMITED");
  }
}

export class QuotaExceededError extends AppError {
  constructor(message = "Plan quota exceeded") {
    super(message, 402, "QUOTA_EXCEEDED");
  }
}

/** Converts any thrown value into a safe JSON HTTP response. */
export function toErrorResponse(err: unknown): NextResponse {
  if (err instanceof ZodError) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: err.flatten() } },
      { status: 422 },
    );
  }
  if (err instanceof AppError) {
    return NextResponse.json(
      { error: { code: err.code, message: err.message } },
      { status: err.statusCode },
    );
  }
  logger.error("Unhandled error", { error: err instanceof Error ? err.message : String(err) });
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
    { status: 500 },
  );
}
