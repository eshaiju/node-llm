import { Provider, ChatRequest, ChatResponse } from "../providers/Provider.js";

export class Executor {
  constructor(
    private readonly provider: Provider,
    private readonly retry: { attempts: number; delayMs: number }
  ) {}

  async executeChat(request: ChatRequest): Promise<ChatResponse> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= this.retry.attempts; attempt++) {
      try {
        return await this.provider.chat(request);
      } catch (error) {
        lastError = error;

        if (attempt >= this.retry.attempts) {
          throw error;
        }

        if (this.retry.delayMs > 0) {
          await new Promise((r) => setTimeout(r, this.retry.delayMs));
        }
      }
    }

    throw lastError;
  }
}
