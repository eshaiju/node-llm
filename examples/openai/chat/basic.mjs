import "dotenv/config";
import { NodeLLM } from "../../../packages/core/dist/index.js";

async function main() {
  // Using NodeLLM directly - requires OPENAI_API_KEY and NODELLM_PROVIDER=openai
  // NodeLLM uses environment variables by default
  // Make sure OPENAI_API_KEY is set in your .env file

  // No model specified - defaults to gpt-4o for OpenAI
  const chat = NodeLLM.chat();
  console.log(`Using model: ${chat.modelId}`);

  // 1. Standard Request
  console.log("--- Standard Request ---");
  const response = await chat.ask("What is Node.js?");
  console.log(response.content);
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
