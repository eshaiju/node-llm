import { createLLM } from "@node-llm/core";
import "dotenv/config";

/**
 * Core principle: NodeLLM is pure infrastructure.
 * This is an immutable instance created at startup.
 */
export const llm = createLLM({
  // Global defaults resolved from environment
  provider: process.env.NODELLM_PROVIDER as any || "openai",
});

// Freeze the instance to ensure it's immutable as per principles
Object.freeze(llm);
