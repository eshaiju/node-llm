import "dotenv/config";
import { createLLM, NodeLLM, Tool, z } from "../../../../packages/core/dist/index.js";

async function main() {
  const llm = createLLM({
    provider: "openrouter",
    openrouterApiKey: process.env.OPENROUTER_API_KEY
  });
  console.log("--- Model Discovery ---");
  const models = await llm.listModels();

  console.log(`Found ${models.length} models.`);
  console.log("First 5 models:");
  models.slice(0, 5).forEach((m) => {
    console.log(`- ${m.id} (${m.name})`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
