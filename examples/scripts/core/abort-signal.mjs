import "dotenv/config";
import { createLLM } from "../../../packages/core/dist/index.js";

async function main() {
  const llm = createLLM({
    provider: "openai",
    openaiApiKey: process.env.OPENAI_API_KEY
  });
  const controller = new AbortController();

  // Abort after 2 seconds
  setTimeout(() => {
    console.log("⏱️  Aborting request...");
    controller.abort();
  }, 2000);

  try {
    const chat = llm.chat("gpt-4o");
    console.log("Sending long-running request...");

    const response = await chat.ask(
      "Write a very long essay about the history of computing, at least 5000 words.",
      { signal: controller.signal }
    );

    console.log("Response:", response.toString());
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("✅ Request successfully aborted!");
    } else {
      throw error;
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
