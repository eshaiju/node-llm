import { Provider, ChatRequest, ChatResponse, ModelInfo, ChatChunk } from "../Provider.js";
import { Capabilities } from "./Capabilities.js";
import { GeminiChat } from "./Chat.js";

export interface GeminiProviderOptions {
  apiKey: string;
  baseUrl?: string;
}

export class GeminiProvider implements Provider {
  private readonly baseUrl: string;
  private readonly chatHandler: GeminiChat;

  public capabilities = {
    supportsVision: (model: string) => Capabilities.supportsVision(model),
    supportsTools: (model: string) => Capabilities.supportsTools(model),
    supportsStructuredOutput: (model: string) => Capabilities.supportsStructuredOutput(model),
    supportsEmbeddings: (model: string) => Capabilities.supportsEmbeddings(model),
    supportsImageGeneration: (model: string) => Capabilities.supportsImageGeneration(model),
    supportsTranscription: (model: string) => Capabilities.supportsTranscription(model),
    supportsModeration: (model: string) => Capabilities.supportsModeration(model),
    getContextWindow: (model: string) => Capabilities.contextWindowFor(model),
  };

  constructor(private readonly options: GeminiProviderOptions) {
    this.baseUrl = options.baseUrl ?? "https://generativelanguage.googleapis.com/v1beta";
    this.chatHandler = new GeminiChat(this.baseUrl, options.apiKey);
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    return this.chatHandler.execute(request);
  }

  // Streaming, listModels, etc. will be added later in Features 2, 3...
}
