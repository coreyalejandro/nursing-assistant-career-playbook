/**
 * server/llm/LLMProvider.ts
 * Provider abstraction so the app can fail over across multiple LLM backends.
 */
export interface GenerationRequest {
  systemInstruction: string;
  userInput: string;
  context?: string;
  maxTokens: number;
  temperature: number;
}

export interface GenerationResponse {
  text: string;
  provider: string;
  latency: number;
  tokensUsed: number;
}

export interface LLMProvider {
  readonly name: string;
  readonly priority: number;
  generate(request: GenerationRequest): Promise<GenerationResponse>;
}
