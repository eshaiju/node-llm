import { vi } from "vitest";
import { BaseProvider, ChatRequest, ChatResponse, ProviderCapabilities } from "@node-llm/core";

export class MockProvider extends BaseProvider {
  get id() {
    return "mock-provider";
  }
  apiBase() {
    return "http://mock";
  }
  headers() {
    return {};
  }
  protected providerName() {
    return "mock-provider";
  }

  capabilities: ProviderCapabilities = {
    supportsVision: () => true,
    supportsTools: () => true,
    supportsStructuredOutput: () => true,
    supportsEmbeddings: () => true,
    supportsImageGeneration: () => true,
    supportsTranscription: () => true,
    supportsModeration: () => true,
    supportsReasoning: () => true,
    supportsDeveloperRole: () => true,
    getContextWindow: () => 128000
  };

  chat = vi.fn(async (req: ChatRequest): Promise<ChatResponse> => {
    return {
      content: `Response to ${req.messages[0]?.content ?? "nothing"}`,
      usage: { input_tokens: 10, output_tokens: 10, total_tokens: 20 }
    };
  });
}
