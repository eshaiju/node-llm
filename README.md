# node-llm

A provider-agnostic LLM core for Node.js, inspired by ruby-llm.

node-llm focuses on:
- clean abstractions
- minimal magic
- streaming-first design
- no SDK lock-in

This is a core library, not a framework.

---

## Features (current)

- **Provider-agnostic chat API**: Switch between OpenAI, Anthropic, etc. with one line of config.
- **Ruby-LLM-style configuration**: Simple, global configuration.
- **Streaming responses**: Native AsyncIterator support for progressive token delivery.
- **Tool calling (Function calling)**: Automatic execution loop for model-requested tools.
- **Multi-modal Support**: Built-in support for Vision (images) and Audio.
- **Smart File Handling**: Pass local file paths or URLs; the library handles reading and encoding.
- **Fluent API**: Chainable methods like `.withTool()` for dynamic tool registration.
- **Retry support**: Configurable retry logic at the execution layer.
- **Strict ESM and TypeScript**: Modern, type-safe development.

---

## Installation

```bash
pnpm add @node-llm/core
```

---

## Configuration

### Environment variables

```text
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
```

Load environment variables in your application:

```ts
import "dotenv/config";
```

---

## Basic Chat Usage

```ts
import { LLM } from "@node-llm/core";

LLM.configure({
  provider: "openai",
});

const chat = LLM.chat("gpt-4o-mini", {
  systemPrompt: "You are a concise assistant",
});

const reply = await chat.ask("Explain HTTP in one sentence");
console.log(reply);
```

---

## Streaming Responses

Streaming uses the native AsyncIterator pattern.

```ts
import { LLM } from "@node-llm/core";

LLM.configure({ provider: "openai" });

const chat = LLM.chat("gpt-4o-mini");

let full = "";

for await (const token of chat.stream("Explain HTTP in one sentence")) {
  process.stdout.write(token);
  full += token;
}

console.log("\nFinal response:", full);
```

---

## Tool Calling

You can define tools and pass them to the chat instance. The model will decide when to call them, and the library handles the execution loop automatically.

```ts
import { LLM, Tool } from "@node-llm/core";

// 1. Define a tool
const weatherTool: Tool = {
  type: 'function',
  function: {
    name: 'get_weather',
    description: 'Get the current weather for a location',
    parameters: {
      type: 'object',
      properties: {
        location: { type: 'string', description: 'The city and state, e.g. San Francisco, CA' },
        unit: { type: 'string', enum: ['celsius', 'fahrenheit'] }
      },
      required: ['location']
    }
  },
  // 2. Implement the handler
  handler: async ({ location, unit = 'celsius' }) => {
    // Call your real API here
    return JSON.stringify({ location, temperature: 22, unit, condition: "Sunny" });
  }
};

// 3. Initialize chat (Option A: via constructor)
const chat = LLM.chat("gpt-4o-mini", {
  tools: [weatherTool]
});

// OR Option B: via fluent API (Ruby-LLM style)
const chat2 = LLM.chat("gpt-4o-mini")
  .withTool(weatherTool);

// 4. Ask a question
const reply = await chat.ask("What is the weather in London?");
console.log(reply); 
// Output: "The weather in London is currently 22°C and sunny."
```

---

## File & Multi-modal Support

You can send files (images, audio, text, etc.) to models that support them. The library automatically handles local file reading, MIME detection, and base64 encoding.

```ts
// Local files (automatically read & converted)
await chat.ask("Analyze this image", {
  files: ["./image.jpg"]
});

// Text files (content is automatically appended to prompt)
await chat.ask("Summarize this code", {
  files: ["./app.ts"]
});

// Remote URLs (passed through)
await chat.ask("Describe this", {
  files: ["https://example.com/photo.png"]
});

// Audio files (OpenAI input_audio support)
await chat.ask("Transcribe this meeting", {
  files: ["./meeting.mp3"]
});
```

---

## Retry Support

Retries are applied before chat execution, not inside providers.

```ts
LLM.configure({
  provider: "openai",
  retry: {
    attempts: 3,
    delayMs: 500,
  },
});
```

Retry behavior:
- Only transient failures are retried
- Chat and providers remain clean
- Designed for future timeouts and circuit breakers

---

## Development

```bash
pnpm install
pnpm --filter @node-llm/core build
node test-openai.mjs
```

---

## Design Philosophy

- **Explicit over implicit**: No hidden side effects or complex state management.
- **Provider-agnostic core**: The same code works across different LLM providers.
- **Ruby-LLM mental model**: Developer experience inspired by the best of Ruby, executed with Node-native patterns.
- **Production Ready**: Built with TypeScript, ESM, and comprehensive testing.

---

## License

MIT
