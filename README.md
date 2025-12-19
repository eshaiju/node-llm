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

- Provider-agnostic chat API
- Ruby-LLM-style configuration
- Streaming responses using AsyncIterator
- Retry support (pre-chat execution layer)
- Strict ESM and TypeScript
- Testable core with fake providers

Tool and function calling is planned but not yet released.

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

Streaming behavior:
- Tokens arrive progressively
- Final assistant message is stored in chat history
- No SDKs or frameworks required

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

- Explicit over implicit
- Provider-agnostic core
- No hidden side effects
- Ruby-LLM mental model with Node-native execution
- Suitable for libraries, services, and frameworks

---

## Roadmap

- Tool and function calling
- Streaming with tools
- Azure OpenAI provider
- Observability hooks
- CLI utilities

---

## License

MIT
