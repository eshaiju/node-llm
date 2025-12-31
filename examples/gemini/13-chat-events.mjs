import "dotenv/config";
import { LLM } from "../../packages/core/dist/index.js";

async function main() {
  LLM.configure({ provider: "gemini" });

  const weatherTool = {
    type: 'function',
    function: {
      name: 'get_weather',
      parameters: {
        type: 'object',
        properties: { location: { type: 'string' } }
      }
    },
    handler: async ({ location }) => {
      return JSON.stringify({ location, temp: 18, unit: 'celsius' });
    }
  };

  const chat = LLM.chat("gemini-2.0-flash");

  // Register event handlers
  chat
    .onNewMessage(() => {
      console.log("🔔 [Event] onNewMessage: AI started responding...");
    })
    .onEndMessage((message) => {
      console.log(`🔔 [Event] onEndMessage: Response finished. (Tokens: ${message.total_tokens})`);
    })
    .onToolCall((toolCall) => {
      console.log(`🔔 [Event] onToolCall: Calling ${toolCall.function.name} with ${toolCall.function.arguments}`);
    })
    .onToolResult((result) => {
      console.log(`🔔 [Event] onToolResult: Tool returned ${result}`);
    });

  console.log("Asking a question that requires a tool...");
  const response = await chat
    .withTool(weatherTool)
    .ask("What is the weather in Tokyo?");

  console.log("\nFinal Response:", response.content);
}

main().catch(console.error);
