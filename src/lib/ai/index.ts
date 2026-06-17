import { env } from "@/env";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { OpenAiProvider } from "@/lib/ai/openai-provider";
import { AnthropicProvider } from "@/lib/ai/anthropic-provider";
import type { AiCompletionOptions, AiCompletionResult, AiProviderClient } from "@/lib/ai/types";

const openai = new OpenAiProvider();
const anthropic = new AnthropicProvider();

function orderedProviders(): AiProviderClient[] {
  const primary = env.AI_PRIMARY_PROVIDER === "anthropic" ? anthropic : openai;
  const secondary = primary === openai ? anthropic : openai;
  return [primary, secondary].filter((p) => p.isConfigured());
}

async function logUsage(
  userId: string | undefined,
  operation: string,
  result: AiCompletionResult,
): Promise<void> {
  if (!userId) return;
  try {
    await prisma.aiUsageLog.create({
      data: {
        userId,
        provider: result.provider,
        model: result.model,
        operation,
        promptTokens: result.usage.promptTokens,
        completionTokens: result.usage.completionTokens,
      },
    });
  } catch (err) {
    logger.warn("Failed to persist AI usage log", { error: String(err) });
  }
}

/**
 * Runs a completion against the primary provider, automatically falling back
 * to the secondary provider on failure. Logs token usage per user.
 */
export async function complete(
  opts: AiCompletionOptions & { userId?: string; operation: string },
): Promise<AiCompletionResult> {
  const providers = orderedProviders();
  if (providers.length === 0) throw new Error("No AI provider is configured");

  let lastError: unknown;
  for (const provider of providers) {
    try {
      const result = await provider.complete(opts);
      await logUsage(opts.userId, opts.operation, result);
      return result;
    } catch (err) {
      lastError = err;
      logger.warn("AI provider failed, attempting fallback", {
        provider: provider.name,
        error: String(err),
      });
    }
  }
  throw lastError instanceof Error ? lastError : new Error("All AI providers failed");
}

/** Streams tokens from the first configured provider (no fallback mid-stream). */
export async function* stream(
  opts: AiCompletionOptions,
): AsyncIterable<string> {
  const providers = orderedProviders();
  if (providers.length === 0) throw new Error("No AI provider is configured");
  yield* providers[0]!.stream(opts);
}

/** Parses a JSON completion safely, returning null on malformed output. */
export function parseJson<T>(text: string): T | null {
  try {
    const cleaned = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}
