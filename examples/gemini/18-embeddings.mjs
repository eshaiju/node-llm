import "dotenv/config";
import { LLM } from "../../packages/core/dist/index.js";

async function main() {
  LLM.configure({ provider: "gemini" });

  console.log("--- Single Item Embedding ---");
  const embedding = await LLM.embed("Node-LLM makes AI easy!");
  
  console.log(`Model: ${embedding.model}`);
  console.log(`Vector length: ${embedding.vector.length}`);
  console.log(`First few values: ${embedding.vector.slice(0, 5).join(", ")}...`);

  console.log("\n--- Batch Embedding ---");
  const batch = await LLM.embed([
    "JavaScript is awesome",
    "Gemini is a powerful model",
    "OpenAI also has great embeddings"
  ]);

  console.log(`Batch count: ${batch.vectors.length}`);
  batch.vectors.forEach((vec, i) => {
    console.log(`Vector ${i} length: ${vec.length}`);
  });

  console.log("\n--- Custom Dimensions (if supported) ---");
  const small = await LLM.embed("Low dimensionality test", {
    model: "text-embedding-004",
    dimensions: 256
  });
  console.log(`Model: ${small.model}`);
  console.log(`Vector length: ${small.vectors[0].length}`);
}

main().catch(console.error);
