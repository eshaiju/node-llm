import "dotenv/config";
import { LLM } from "../../packages/core/dist/index.js";

LLM.configure({ 
  provider: "gemini",
});

async function main() {
  // For Gemini, we primarily use the listModels() which uses the live Google API
  // but we can also use the local registry if it's populated.
  console.log("Fetching Gemini models directly from API...");
  const models = await LLM.listModels();

  const modelId = "gemini-2.0-flash";
  const model = models.find(m => m.id === modelId);

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
    console.log(`Model ${modelId} not found.`);
  }

  // List all Gemini models
  console.log("\nAll Available Gemini Models:");
  models.forEach(m => {
    console.log(`- ${m.id} (${m.name})`);
  });
}

main().catch(console.error);
