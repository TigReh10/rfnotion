import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/env";
import type {
  AiCompletionOptions,
  AiCompletionResult,
  AiMessage,
  AiProviderClient,
} from "@/lib/ai/types";

function splitSystem(messages: AiMessage[]): { system: string; rest: AiMessage[] } {
  const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
  const rest = messages.filter((m) => m.role !== "system");
  return { system, rest };
}

export class AnthropicProvider implements AiProviderClient {
  readonly name = "ANTHROPIC" as const;
  private client: Anthropic | null;

  constructor() {
    this.client = env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY }) : null;
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async complete(opts: AiCompletionOptions): Promise<AiCompletionResult> {
    if (!this.client) throw new Error("Anthropic is not configured");
    const { system, rest } = splitSystem(opts.messages);
    const res = await this.client.messages.create({
      model: env.ANTHROPIC_MODEL,
      max_tokens: opts.maxTokens ?? 2048,
      temperature: opts.temperature ?? 0.3,
      system: system || undefined,
      messages: rest.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
    });
    const text = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
    return {
      text,
      usage: {
        promptTokens: res.usage.input_tokens,
        completionTokens: res.usage.output_tokens,
      },
      provider: this.name,
      model: env.ANTHROPIC_MODEL,
    };
  }

  async *stream(opts: AiCompletionOptions): AsyncIterable<string> {
    if (!this.client) throw new Error("Anthropic is not configured");
    const { system, rest } = splitSystem(opts.messages);
    const stream = this.client.messages.stream({
      model: env.ANTHROPIC_MODEL,
      max_tokens: opts.maxTokens ?? 2048,
      temperature: opts.temperature ?? 0.3,
      system: system || undefined,
      messages: rest.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
    });
    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        yield event.delta.text;
      }
    }
  }
}
