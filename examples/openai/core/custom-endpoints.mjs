import { createLLM, NodeLLM, Tool, z } from "../../../packages/core/dist/index.js";
import 'dotenv/config';

/**
 * This example demonstrates configuring for Custom Endpoints (e.g. Azure OpenAI).
 */

async function main() {
  const llm = createLLM({
    provider: 'openai',
    openaiApiKey: process.env.AZURE_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
    openaiApiBase: process.env.AZURE_OPENAI_API_BASE_ENDPOINT || "https://api.openai.com/v1"
  });

  console.log('=== Custom Endpoint Example ===\n');

  try {
    const chat = llm.chat('gpt-4o-mini');
    const response = await chat.ask('What is an API gateway?');
    console.log('Response:', response.content);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
