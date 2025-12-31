import { providerRegistry } from "../registry.js";
import { GeminiProvider } from "./GeminiProvider.js";

let registered = false;

/**
 * Idempotent registration of the Gemini provider.
 * Automatically called by LLM.configure({ provider: 'gemini' })
 */
export function registerGeminiProvider() {
  if (registered) return;

  providerRegistry.register("gemini", () => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }

    return new GeminiProvider({ apiKey });
  });

  registered = true;
}

/**
 * Alias for registerGeminiProvider for internal use.
 */
export const ensureGeminiRegistered = registerGeminiProvider;

export * from "./GeminiProvider.js";
