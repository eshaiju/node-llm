import "dotenv/config";
import { LLM } from "../../packages/core/dist/index.js";

async function main() {
  LLM.configure({ provider: "openai" });

  console.log("--- Low Temperature (0.2: Factual) ---");
  const factualChat = LLM.chat("gpt-4o-mini").withTemperature(0.2);
  const response1 = await factualChat.ask("What is the boiling point of water at sea level in Celsius?");
  console.log(response1.content);
  console.log("");

  console.log("--- High Temperature (0.9: Creative) ---");
  const creativeChat = LLM.chat("gpt-4o-mini").withTemperature(0.9);
  const response2 = await creativeChat.ask("Write a short poem about the color blue.");
  console.log(response2.content);
}

main().catch(console.error);
