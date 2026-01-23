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

    // Build the config object with all available credentials
    const bedrockConfig: BedrockConfig = {
      region,
      apiKey: cfg.bedrockApiKey,
      accessKeyId: cfg.bedrockAccessKeyId,
      secretAccessKey: cfg.bedrockSecretAccessKey,
      sessionToken: cfg.bedrockSessionToken
    };

    // Ensure at least one auth method is provided
    if (!bedrockConfig.apiKey && (!bedrockConfig.accessKeyId || !bedrockConfig.secretAccessKey)) {
      throw new Error(
        "Bedrock requires either bedrockApiKey (AWS_BEARER_TOKEN_BEDROCK) or " +
          "bedrockAccessKeyId/bedrockSecretAccessKey (AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY)"
      );
    }

    return new BedrockProvider(bedrockConfig);
  });
}

export { BedrockProvider, BedrockConfig } from "./BedrockProvider.js";
export { BedrockChat } from "./Chat.js";
export * from "./types.js";
