import { ModelInfo } from "../providers/Provider.js";

export class ModelRegistry {
  private models: Map<string, ModelInfo> = new Map();
  private static readonly API_URL = "https://api.parsera.org/v1/llm-specs";

  /**
   * Refresh model information from the Parsera API
   */
  async refresh(): Promise<void> {
    try {
      const response = await fetch(ModelRegistry.API_URL);
      if (!response.ok) {
        throw new Error(`Failed to refresh models: ${response.statusText}`);
      }

      const specs = await response.json();
      this.models.clear();

      for (const spec of specs) {
        this.models.set(spec.id, {
          id: spec.id,
          name: spec.name || spec.id,
          provider: spec.provider,
          family: spec.family || spec.provider,
          context_window: spec.context_window,
          max_output_tokens: spec.max_output_tokens,
          modalities: spec.modalities || { input: ["text"], output: ["text"] },
          capabilities: spec.capabilities || [],
          pricing: spec.pricing || {},
          metadata: spec.metadata || {}
        });
      }
    } catch (error) {
      console.error("Error refreshing model registry:", error);
      throw error;
    }
  }

  /**
   * Find a model by ID
   */
  find(id: string): ModelInfo | undefined {
    return this.models.get(id);
  }

  /**
   * List all known models
   */
  all(): ModelInfo[] {
    return Array.from(this.models.values());
  }

  /**
   * Filter models by provider
   */
  byProvider(provider: string): ModelInfo[] {
    return this.all().filter(m => m.provider === provider);
  }
}

export const models = new ModelRegistry();
