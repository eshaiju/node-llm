import "dotenv/config";
import { LLM } from "../../packages/core/dist/index.js";

async function main() {
  LLM.configure({ provider: "openai" });

  const chat = LLM.chat("gpt-4o-mini");

  // Set the initial instruction
  console.log("Setting initial instruction...");
  chat.withInstructions("You are a helpful assistant that explains Ruby concepts simply, like explaining to a five-year-old.");

  console.log("User: What is a variable?");
  let response = await chat.ask("What is a variable?");
  console.log(`Assistant: ${response.content}\n`);

  // Use replace: true to ensure only the latest instruction is active
  console.log("Updating instruction (replace: true)...");
  chat.withInstructions("Always end your response with 'Got it?'", { replace: true });

  console.log("User: What is a loop?");
  response = await chat.ask("What is a loop?");
  console.log(`Assistant: ${response.content}\n`);
}

main().catch(console.error);
