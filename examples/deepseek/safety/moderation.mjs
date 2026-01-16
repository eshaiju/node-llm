import "dotenv/config";
import { createLLM, NodeLLM, Tool, z } from "../../../packages/core/dist/index.js";

async function main() {
  const llm = createLLM({
    provider: "deepseek",
    deepseekApiKey: process.env.DEEPSEEK_API_KEY
  });
  console.log("Attempting moderation request with DeepSeek...");
  try {
    await llm.moderate({ input: "Some content" });
  } catch (error) {
    console.log("✅ Correctly caught unsupported operation error:");
    console.error(error.message);
  }
}

main().catch(console.error);
