import "dotenv/config";
import { createLLM, NodeLLM, Tool, z } from "../../../../packages/core/dist/index.js";

async function main() {
  const llm = createLLM({
    provider: "openrouter",
    openrouterApiKey: process.env.OPENROUTER_API_KEY
  });
  const chat = llm.chat("gpt-4o-mini");

  // 1. Standard Request
  console.log("--- Standard Request ---");
  const response = await chat.ask("What is OpenRouter?");
  console.log(response.content);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
