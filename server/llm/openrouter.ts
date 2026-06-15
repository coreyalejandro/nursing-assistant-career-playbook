/**
 * server/llm/openrouter.ts
 * ---------------------------------------------------------------------------
 * OpenRouter model client (OpenAI-compatible Chat Completions API).
 *
 * Why OpenRouter: one API, any model (OpenAI, Anthropic, Llama, Mistral, …) —
 * swap the model with an env var, no vendor lock-in. Live web search is
 * available on any model via OpenRouter's ":online" suffix, which replaces the
 * Gemini-specific Google Search grounding we used before.
 *
 * Config (env):
 *   OPENROUTER_API_KEY  — required at runtime
 *   OPENROUTER_MODEL    — default model id (e.g. "openai/gpt-4o-mini")
 *   APP_URL             — sent as HTTP-Referer (OpenRouter attribution)
 * ---------------------------------------------------------------------------
 */
import type { GenerationRequest, GenerationResponse, LLMProvider } from "./LLMProvider";

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-4o-mini";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  /** Force a JSON object response (OpenAI json_object mode). */
  json?: boolean;
  /** Enable live web search by appending OpenRouter's ":online" suffix. */
  web?: boolean;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export function hasOpenRouter(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

export function resolveModel(opts: ChatOptions = {}): string {
  let model = opts.model || process.env.OPENROUTER_MODEL || DEFAULT_MODEL;
  if (opts.web && !model.includes(":online")) model = `${model}:online`;
  return model;
}

/** Call OpenRouter and return the assistant message text. Throws on failure. */
export async function chat(messages: ChatMessage[], opts: ChatOptions = {}): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY is not configured.");

  const body: Record<string, unknown> = {
    model: resolveModel(opts),
    messages,
    temperature: opts.temperature ?? 0.7,
  };
  if (opts.maxTokens) body.max_tokens = opts.maxTokens;
  if (opts.json) body.response_format = { type: "json_object" };

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.APP_URL || "https://localhost",
      "X-Title": "CNA Career Playbook",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`OpenRouter ${res.status}: ${detail.slice(0, 300)}`);
  }
  const data: any = await res.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

/** LLMProvider implementation so OpenRouter plugs into FallbackProvider. */
export class OpenRouterProvider implements LLMProvider {
  readonly name = "openrouter";
  readonly priority = 1;
  constructor(private model?: string) {}
  async generate(request: GenerationRequest): Promise<GenerationResponse> {
    const started = Date.now();
    const messages: ChatMessage[] = [{ role: "system", content: request.systemInstruction }];
    if (request.context) messages.push({ role: "user", content: request.context });
    messages.push({ role: "user", content: request.userInput });
    const text = await chat(messages, {
      model: this.model,
      temperature: request.temperature,
      maxTokens: request.maxTokens,
    });
    return { text, provider: this.name, latency: Date.now() - started, tokensUsed: 0 };
  }
}
