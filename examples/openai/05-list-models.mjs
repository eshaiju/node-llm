import "dotenv/config";
import { LLM } from "../../packages/core/dist/index.js";

LLM.configure({ 
  provider: "openai"
});

async function main() {
  console.log("Fetching models...");
  const models = await LLM.listModels();
  
  console.log(`Found ${models.length} models.`);
  console.log("\nTop 5 Models:");
  models.slice(0, 5).forEach(m => {
    console.log(`- ${m.id} (${m.name})`);
  });
}

main();
