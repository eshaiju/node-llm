import "dotenv/config";
import { createLLM, NodeLLM, Tool, z } from "../../../../packages/core/dist/index.js";

async function main() {
  const llm = createLLM({
    provider: "openrouter",
    openrouterApiKey: process.env.OPENROUTER_API_KEY
  });
  const weatherTool = {
    type: "function",
    function: {
      name: "get_weather",
      description: "Get weather",
      parameters: { type: "object", properties: { location: { type: "string" } } }
    },
    handler: async ({ location }) => {
      return JSON.stringify({ location, temperature: 22, condition: "Sunny" });
    }
  };

  const chat = llm.chat("openai/gpt-4o-mini").withTool(weatherTool);

  console.log("--- Tool Calling Request ---");
  const response = await chat.ask("What is the weather in London?");
  console.log(response.content);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
