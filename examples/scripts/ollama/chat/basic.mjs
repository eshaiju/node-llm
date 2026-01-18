import "dotenv/config";
import { NodeLLM } from "../../../../packages/core/dist/index.js";

// PREREQUISITE:
// Ensure you have Ollama running and reachable.
// And have pulled the model: `ollama pull llama3`

async function main() {
  // Pattern: Direct Usage (Singleton)
  // NodeLLM will use NODELLM_PROVIDER=ollama if set
  // or we can use NodeLLM.withProvider("ollama")
  const llm = NodeLLM.withProvider("ollama");

  console.log("🦙 Running Ollama Basic Chat Example");

  // 2. Create Chat (specifying the model ID)
  // Ensure 'llama3' is installed via `ollama list`
  const chat = llm.chat("llama3");

  console.log("User: Why is the sky blue?");

  try {
    const response = await chat.ask("Why is the sky blue?");
    console.log("AI:", response.content);
  } catch (error) {
    if (error.cause?.code === "ECONNREFUSED") {
      console.error("❌ Link Error: Could not connect to Ollama at http://localhost:11434");
    } else {
      console.error("❌ Error:", error.message);
      console.error("Hint: Did you run 'ollama pull llama3'?");
    }
  }
}

main();
