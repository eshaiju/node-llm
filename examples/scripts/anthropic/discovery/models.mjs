import "dotenv/config";
import { createLLM, NodeLLM, Tool, z } from "../../../../packages/core/dist/index.js";

async function main() {
  const llm = createLLM({
    provider: "anthropic",
    anthropicApiKey: process.env.ANTHROPIC_API_KEY
  });
  try {
    const models = await llm.listModels();
    console.log("Available Models:");
    models.forEach((m) => console.log(`- ${m.id}`));
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

main();
