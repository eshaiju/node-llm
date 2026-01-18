# @node-llm/core

<p align="left">
  <a href="https://node-llm.eshaiju.com/">
    <img src="https://node-llm.eshaiju.com/assets/images/logo.jpg" alt="NodeLLM logo" width="300" />
  </a>
</p>

[![npm version](https://img.shields.io/npm/v/@node-llm/core.svg)](https://www.npmjs.com/package/@node-llm/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

**The production-grade LLM engine for Node.js. Provider-agnostic by design.**

`@node-llm/core` provides a single, unified API for interacting with over 540+ models across all major providers. It is built for developers who need stable infrastructure, standard streaming, and automated tool execution without vendor lock-in.

---

## 🚀 Key Features

- **Unified API**: One interface for OpenAI, Anthropic, Gemini, DeepSeek, OpenRouter, and Ollama.
- **Automated Tool Loops**: Recursive tool execution handled automatically—no manual loops required.
- **Streaming + Tools**: Seamlessly execute tools and continue the stream with the final response.
- **Structured Output**: Native Zod support for rigorous schema validation (`.withSchema()`).
- **Multimodal engine**: Built-in handling for Vision, Audio (Whisper), and Video (Gemini).
- **Security-First**: Integrated circuit breakers for timeouts, max tokens, and infinite tool loops.

---

## 📋 Supported Providers

| Provider       | Supported Features                                               |
| :------------- | :--------------------------------------------------------------- |
| **OpenAI**     | Chat, Streaming, Tools, Vision, Audio, Images, Reasoning (o1/o3) |
| **Anthropic**  | Chat, Streaming, Tools, Vision, PDF Support (Claude 3.5)         |
| **Gemini**     | Chat, Streaming, Tools, Vision, Audio, Video, Embeddings         |
| **DeepSeek**   | Chat (V3), Reasoning (R1), Streaming + Tools                     |
| **OpenRouter** | 540+ models via a single API with automatic capability detection |
| **Ollama**     | Local LLM inference with full Tool and Vision support            |

---

## ⚡ Quick Start

### Installation

```bash
npm install @node-llm/core
```

### Basic Chat & Streaming

NodeLLM automatically reads your API keys from environment variables (e.g., `OPENAI_API_KEY`).

```ts
import { createLLM } from "@node-llm/core";

const llm = createLLM({ provider: "openai" });

// 1. Standard Request
const res = await llm.chat("gpt-4o").ask("What is the speed of light?");
console.log(res.content);

// 2. Real-time Streaming
for await (const chunk of llm.chat().stream("Tell me a long story")) {
  process.stdout.write(chunk.content);
}
```

### Structured Output (Zod)

Stop parsing markdown. Get typed objects directly.

```ts
import { z } from "@node-llm/core";

const PlayerSchema = z.object({
  name: z.string(),
  powerLevel: z.number(),
  abilities: z.array(z.string())
});

const chat = llm.chat("gpt-4o-mini").withSchema(PlayerSchema);
const response = await chat.ask("Generate a random RPG character");

console.log(response.parsed.name); // Fully typed!
```

---

## 🛡️ Security Circuit Breakers

NodeLLM protects your production environment with four built-in safety pillars:

```ts
const llm = createLLM({
  requestTimeout: 15000, // 15s DoS Protection
  maxTokens: 4096, // Cost Protection
  maxRetries: 3, // Retry Storm Protection
  maxToolCalls: 5 // Infinite Loop Protection
});
```

---

## 💾 Ecosystem

Looking for persistence? use **[@node-llm/orm](https://www.npmjs.com/package/@node-llm/orm)**.

- Automatically saves chat history to PostgreSQL/MySQL/SQLite via Prisma.
- Tracks tool execution results and API metrics (latency, cost, tokens).

---

## 📚 Full Documentation

Visit **[node-llm.eshaiju.com](https://node-llm.eshaiju.com/)** for:

- [Deep Dive into Tool Calling](https://node-llm.eshaiju.com/core-features/tools)
- [Multi-modal Vision & Audio Guide](https://node-llm.eshaiju.com/core-features/multimodal)
- [Custom Provider Plugin System](https://node-llm.eshaiju.com/advanced/custom-providers)

---

## License

MIT © [NodeLLM Contributors]
