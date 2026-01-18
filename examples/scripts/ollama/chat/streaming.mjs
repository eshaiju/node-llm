import { createLLM, NodeLLM, Tool, z } from "../../../../packages/core/dist/index.js";

async function main() {
  const llm = createLLM({
    provider: "ollama"
  });
  console.log("🦙 Ollama Streaming Chat Example");

  const chat = llm.chat("llama3");

  const prompt = "Write a haiku about TypeScript.";
  console.log(`User: ${prompt}`);
  process.stdout.write("AI: ");

  try {
    for await (const chunk of chat.stream(prompt)) {
      process.stdout.write(chunk.content);
    }
    console.log("\n");
  } catch (error) {
    console.error("\nError:", error.message);
  }
}
main();
