import "dotenv/config";
import { createLLM, NodeLLM, Tool, z } from "../../../packages/core/dist/index.js";

async function main() {
  const llm = createLLM({
    provider: "anthropic",
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  });
  console.log("Attempting to transcribe audio with Anthropic...");

  try {
    await llm.transcribe({
      file: "dummy.mp3",
    });
  } catch (error) {
    console.log("Caught expected error:", error.message);
    if (error.message === "Anthropic doesn't support transcription") {
      console.log("✅ Error message matches expectation.");
    } else {
      console.log("❌ Error message does not match expectation:", error.message);
    }
  }
}

main();
