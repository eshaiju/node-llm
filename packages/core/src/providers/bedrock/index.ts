/**
 * Bedrock Provider - Public Exports
 */

import { config as globalConfig } from "../../config.js";
import { providerRegistry } from "../registry.js";
import { BedrockProvider } from "./BedrockProvider.js";
import { BedrockConfig } from "./config.js";

export function registerBedrockProvider() {
  providerRegistry.register("bedrock", (config) => {
    const cfg = config || globalConfig;
    const region = cfg.bedrockRegion;

    if (!region) {
      throw new Error("bedrockRegion is not set in config or AWS_REGION environment variable");
    }

    // Build the config object, prioritizing API Key (Bearer token) if present
    const bedrockConfig: BedrockConfig = {
      region,
      apiKey: cfg.bedrockApiKey
    };

    // If no API Key, use SigV4 (IAM)
    if (!bedrockConfig.apiKey) {
      if (cfg.bedrockAccessKeyId && cfg.bedrockSecretAccessKey) {
        bedrockConfig.accessKeyId = cfg.bedrockAccessKeyId;
        bedrockConfig.secretAccessKey = cfg.bedrockSecretAccessKey;
        bedrockConfig.sessionToken = cfg.bedrockSessionToken;
      }
    }

    return new BedrockProvider(bedrockConfig);
  });
}

export { BedrockProvider, BedrockConfig } from "./BedrockProvider.js";
export { BedrockChat } from "./Chat.js";
export * from "./types.js";
