import "dotenv/config";
import { LLM } from "../../packages/core/dist/index.js";

async function main() {
  LLM.configure({ provider: "openai" });

  const chat = LLM.chat("gpt-4o-mini");

  chat
    .onNewMessage(() => {
      process.stdout.write("\n🔔 [Event] onNewMessage triggered!\nAssistant > ");
    })
    .onEndMessage(() => {
      console.log("\n🔔 [Event] onEndMessage triggered!");
    });

  console.log("Streaming a response...");
  for await (const chunk of chat.stream("Count from 1 to 5 slowly.")) {
    process.stdout.write(chunk.content || "");
  }
  console.log("");
}

main().catch(console.error);
