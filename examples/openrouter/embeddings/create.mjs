import "dotenv/config";
import { createLLM, NodeLLM, Tool, z } from "../../../packages/core/dist/index.js";

async function main() {
  const llm = createLLM({
    provider: "openrouter",
    openrouterApiKey: process.env.OPENROUTER_API_KEY,
  });
  console.log("--- Single Embedding ---");
  const response = await llm.embed("Hello OpenRouter!", {
    model: "text-embedding-3-small"
  });
  console.log(`Vector dimensions: ${response.vectors[0].length}`);

  console.log("\n--- Batch Embedding ---");
  const batchResponse = await llm.embed(["Hello", "World"], {
    model: "text-embedding-3-small"
  });
  console.log(`Generated ${batchResponse.vectors.length} vectors.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
