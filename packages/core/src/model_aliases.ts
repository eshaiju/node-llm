// This file is auto-generated or manually maintained to map generic model aliases
// to provider-specific model IDs.
// @ts-ignore
import aliases from "./aliases.json" assert { type: "json" };

export type ProviderName = "openai" | "anthropic" | "gemini" | "vertexai" | "openrouter" | "mistral" | "deepseek" | "bedrock" | string;

export function resolveModelAlias(alias: string, provider?: ProviderName): string {
  if (!provider) {
    return alias;
  }

  // Check if the alias exists in our registry
  const aliasEntry = (aliases as Record<string, Record<string, string>>)[alias];
  
  if (aliasEntry) {
    // Check if there is a specific mapping for this provider
    if (aliasEntry[provider.toLowerCase()]) {
      return aliasEntry[provider.toLowerCase()] as string;
    }
  }

  // If no alias found or no mapping for this provider, return the original string
  // This allows users to pass raw model IDs that aren't in our alias list.
  return alias;
}
