import { createLLM, NodeLLM } from "@node-llm/core";
import dotenv from "dotenv";

dotenv.config();

export const agent = NodeLLM.withProvider("openai", {
  openaiApiKey: process.env.OPENAI_API_KEY
});

export const anthropic = NodeLLM.withProvider("anthropic", {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY
});

// Primary orchestrator instance
export const systemAuditCore = agent;
