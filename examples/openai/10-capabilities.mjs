import "dotenv/config";
import { LLM } from "../../packages/core/dist/index.js";

async function main() {
  console.log("Refreshing model registry from Parsera API...");
  await LLM.models.refresh();

  const modelId = "gpt-4o-mini";
  const model = LLM.models.find(modelId);

  if (model) {
    console.log(`\nModel Details: ${model.name}`);
    console.log(`Provider: ${model.provider}`);
    console.log(`Context Window: ${model.context_window} tokens`);
    console.log(`Max Output: ${model.max_output_tokens} tokens`);
    console.log(`Capabilities: ${model.capabilities.join(", ")}`);
    
    if (model.pricing?.text_tokens?.standard) {
      const pricing = model.pricing.text_tokens.standard;
      console.log(`Pricing (per 1M tokens):`);
      console.log(`  Input: $${pricing.input_per_million}`);
      console.log(`  Output: $${pricing.output_per_million}`);
    }
  } else {
    console.log(`Model ${modelId} not found in registry.`);
  }

  // List all OpenAI models known by Parsera
  console.log("\nAll Available OpenAI Models:");
  const openaiModels = LLM.models.byProvider("openai");
  openaiModels.forEach(m => {
    console.log(`- ${m.id} (${m.name})`);
  });
}

main().catch(console.error);
