import OpenAI from "openai";
import { env } from "@/env";
import type {
  AiCompletionOptions,
  AiCompletionResult,
  AiProviderClient,
} from "@/lib/ai/types";

export class OpenAiProvider implements AiProviderClient {
  readonly name = "OPENAI" as const;
  private client: OpenAI | null;

  constructor() {
    this.client = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async complete(opts: AiCompletionOptions): Promise<AiCompletionResult> {
    if (!this.client) throw new Error("OpenAI is not configured");
    const res = await this.client.chat.completions.create({
      model: env.OPENAI_MODEL,
      temperature: opts.temperature ?? 0.3,
      max_tokens: opts.maxTokens ?? 2048,
      response_format: opts.json ? { type: "json_object" } : undefined,
      messages: opts.messages,
    });
    const choice = res.choices[0];
    return {
      text: choice?.message?.content ?? "",
      usage: {
        promptTokens: res.usage?.prompt_tokens ?? 0,
        completionTokens: res.usage?.completion_tokens ?? 0,
      },
      provider: this.name,
      model: env.OPENAI_MODEL,
    };
  }

  async *stream(opts: AiCompletionOptions): AsyncIterable<string> {
    if (!this.client) throw new Error("OpenAI is not configured");
    const stream = await this.client.chat.completions.create({
      model: env.OPENAI_MODEL,
      temperature: opts.temperature ?? 0.3,
      max_tokens: opts.maxTokens ?? 2048,
      stream: true,
      messages: opts.messages,
    });
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) yield delta;
    }
  }
}
