import { config as globalConfig } from "../../config.js";
import { providerRegistry } from "../registry.js";
import { OpenAIProvider } from "./OpenAIProvider.js";

let registered = false;

/**
 * Idempotent registration of the OpenAI provider.
 * Automatically called when using createLLM({ provider: 'openai' })
 */
export function registerOpenAIProvider() {
  if (registered) return;

  providerRegistry.register("openai", (config) => {
    const cfg = config || globalConfig;
    const apiKey = cfg.openaiApiKey;
    const baseUrl = cfg.openaiApiBase;

    if (!apiKey) {
      throw new Error("openaiApiKey is not set in config or OPENAI_API_KEY environment variable");
    }

    return new OpenAIProvider({ apiKey, baseUrl });
  });

  registered = true;
}

/**
 * Alias for registerOpenAIProvider for internal use.
 */
export const ensureOpenAIRegistered = registerOpenAIProvider;
