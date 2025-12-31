import { LLM } from "../../packages/core/dist/index.js";
import "dotenv/config";

// 1. Configure the Provider
LLM.configure({
  provider: "gemini", // Uses GEMINI_API_KEY from env
});

// 2. Create Chat
const chat = LLM.chat("gemini-2.0-flash", {
  systemPrompt: "You are a helpful assistant that answers in the style of a pirate."
});

// 3. Ask a question
console.log("Asking Gemini...");
const response = await chat.ask("What is the best way to find buried treasure?");

console.log("\n--- Response ---");
console.log(response.content);

console.log("\n--- Metadata ---");
console.log(`Model: ${response.model_id}`);
console.log(`Input Tokens: ${response.usage.input_tokens}`);
console.log(`Output Tokens: ${response.usage.output_tokens}`);
console.log(`Total Tokens: ${response.usage.total_tokens}`);
