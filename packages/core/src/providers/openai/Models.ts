import { ModelInfo } from "../Provider.js";
import { Capabilities } from "./Capabilities.js";

export class OpenAIModels {
  constructor(private readonly baseUrl: string, private readonly apiKey: string) {}

  async execute(): Promise<ModelInfo[]> {
    const response = await fetch(`${this.baseUrl}/models`, {
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI error (${response.status}): ${errorText}`);
    }

    const json = await response.json();
    return json.data.map((model: any) => ({
      id: model.id,
      name: Capabilities.formatDisplayName(model.id),
      provider: "openai",
      family: Capabilities.getFamily(model.id),
      context_window: Capabilities.getContextWindow(model.id),
      max_output_tokens: Capabilities.getMaxOutputTokens(model.id),
      modalities: Capabilities.getModalities(model.id),
      capabilities: Capabilities.getCapabilities(model.id),
      pricing: Capabilities.getPricing(model.id),
      metadata: {
        owned_by: model.owned_by,
      },
    }));
  }
}
