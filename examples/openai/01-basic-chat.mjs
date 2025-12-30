import "dotenv/config";
import { LLM } from "../../packages/core/dist/index.js";

LLM.configure({ 
  provider: "openai"
});

async function main() {
  const chat = LLM.chat("gpt-4o-mini", {
    systemPrompt: "You are a concise assistant",
  });

  console.log("Asking: What is the capital of France?");
  const reply = await chat.ask("What is the capital of France?");
  console.log("Reply:", reply);
}

main();
