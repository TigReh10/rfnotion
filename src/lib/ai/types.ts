export type AiRole = "system" | "user" | "assistant";

export interface AiMessage {
  role: AiRole;
  content: string;
}

export interface AiCompletionOptions {
  messages: AiMessage[];
  temperature?: number;
  maxTokens?: number;
  /** When true, request a JSON object response. */
  json?: boolean;
}

export interface AiUsage {
  promptTokens: number;
  completionTokens: number;
}

export interface AiCompletionResult {
  text: string;
  usage: AiUsage;
  provider: "OPENAI" | "ANTHROPIC";
  model: string;
}

export interface AiProviderClient {
  readonly name: "OPENAI" | "ANTHROPIC";
  isConfigured(): boolean;
  complete(opts: AiCompletionOptions): Promise<AiCompletionResult>;
  stream(opts: AiCompletionOptions): AsyncIterable<string>;
}
