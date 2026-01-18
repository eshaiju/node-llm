import "dotenv/config";
import { createLLM, NodeLLM, Tool, z } from "../../../../packages/core/dist/index.js";

async function main() {
  const llm = createLLM({
    provider: "gemini",
    geminiApiKey: process.env.GEMINI_API_KEY
  });
  console.log("Attempting to moderate content with Gemini...");

  try {
    await llm.moderate({
      input: "I want to hurt someone"
    });
  } catch (error) {
    console.log("Caught expected error:", error.message);
    if (error.message === "Gemini doesn't support moderation") {
      console.log("✅ Error message matches expectation.");
    } else {
      console.log("❌ Error message does not match expectation:", error.message);
    }
  }
}

main();
