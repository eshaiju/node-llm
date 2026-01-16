import "dotenv/config";
import { createLLM, NodeLLM, Tool, z } from "../../../packages/core/dist/index.js";

async function main() {
  const llm = createLLM({
    provider: "openai",
    openaiApiKey: process.env.OPENAI_API_KEY
  });
  const chat = llm.chat("gpt-4o-mini");

  console.log("Turn 1: Casual conversation...");
  await chat.ask("How are you?");
  console.log(`Usage: In=${chat.totalUsage.input_tokens}, Out=${chat.totalUsage.output_tokens}`);

  console.log("\nTurn 2: Complex request...");
  await chat.ask("Summarize the history of AI in 50 words.");

  console.log("\n--- Final Aggregated Session Usage ---");
  console.log(`Input Tokens:  ${chat.totalUsage.input_tokens}`);
  console.log(`Output Tokens: ${chat.totalUsage.output_tokens}`);
  console.log(`Total Tokens:  ${chat.totalUsage.total_tokens}`);
  console.log(`Session Cost:  $${chat.totalUsage.cost?.toFixed(6) || "0.000000"}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
