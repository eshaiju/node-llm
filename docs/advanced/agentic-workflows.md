---
layout: default
title: Agentic Workflows
nav_order: 2
parent: Advanced
permalink: /advanced/agentic-workflows
description: Compose LLM calls into intelligent workflows that route, research, and collaborate.
---

# {{ page.title }}
{: .no_toc }

{{ page.description }}
{: .fs-6 .fw-300 }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

This guide shows you how to compose NodeLLM primitives into more sophisticated patterns. Nothing here is magic—it's just tools calling other LLMs.

---

## The Core Idea

An "agent" in NodeLLM is just a tool that happens to call another LLM inside its `execute()` method. That's it. No special framework, no orchestration layer—just composition.

```typescript
class MyAgent extends Tool {
  async execute(args) {
    // This tool IS an agent because it calls another LLM
    const response = await createLLM({ provider: "openai" })
      .chat("gpt-4o")
      .ask(args.query);
    return response.content;
  }
}
```

Everything below builds on this simple pattern.

---

## Model Routing

Route requests to the best model for the job. Useful when you want GPT-4 for code, Claude for creative writing, and Gemini for factual lookups.

```typescript
import { createLLM, Tool, z } from "@node-llm/core";

class SmartRouter extends Tool {
  name = "smart_router";
  description = "Routes to the best model for the task";
  schema = z.object({
    query: z.string().describe("The user's request")
  });

  async execute({ query }) {
    // Step 1: Classify the task with a fast model
    const taskType = await this.classify(query);

    // Step 2: Route to specialist
    const specialists = {
      code: { provider: "openai", model: "gpt-4o" },
      creative: { provider: "anthropic", model: "claude-sonnet-4-20250514" },
      factual: { provider: "gemini", model: "gemini-2.0-flash" }
    };

    const { provider, model } = specialists[taskType] || specialists.factual;
    const response = await createLLM({ provider }).chat(model).ask(query);
    return response.content;
  }

  private async classify(query: string) {
    const response = await createLLM({ provider: "openai" })
      .chat("gpt-4o-mini")
      .system("Classify as: code, creative, or factual. One word only.")
      .ask(query);
    return response.content.toLowerCase().trim();
  }
}
```

---

## RAG (Retrieval-Augmented Generation)

Combine vector search with LLM generation. NodeLLM provides `llm.embed()` for embeddings; you bring your own vector store.

This pattern is demonstrated in the [HR Chatbot Example](https://github.com/node-llm/node-llm/tree/main/examples/applications/hr-chatbot-rag).

```typescript
import { createLLM, Tool, z } from "@node-llm/core";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const llm = createLLM({ provider: "openai" });

class KnowledgeSearch extends Tool {
  name = "search_knowledge";
  description = "Searches internal documents for relevant context";
  schema = z.object({
    query: z.string().describe("What to search for")
  });

  async execute({ query }) {
    // 1. Embed the query
    const embedding = await llm.embed(query);

    // 2. Vector search with pgvector
    const docs = await prisma.$queryRaw`
      SELECT title, content
      FROM documents
      ORDER BY embedding <-> ${embedding.vector}::vector
      LIMIT 3
    `;

    // 3. Format as context
    return docs.map(d => `[${d.title}]: ${d.content}`).join("\n\n");
  }
}

// Usage
const chat = llm
  .chat("gpt-4o")
  .system("Answer based on the search results. Cite sources.")
  .withTool(new KnowledgeSearch());

await chat.ask("What's our vacation policy?");
```

---

## Multi-Agent Collaboration

Tools can call other tools (via the coordinator), or tools can directly spawn their own LLM calls. Here's the "research then write" pattern:

```typescript
import { createLLM, Tool, z } from "@node-llm/core";

class Researcher extends Tool {
  name = "research";
  description = "Gathers facts about a topic";
  schema = z.object({ topic: z.string() });

  async execute({ topic }) {
    const response = await createLLM({ provider: "gemini" })
      .chat("gemini-2.0-flash")
      .system("List 5 key facts about the topic.")
      .ask(topic);
    return response.content;
  }
}

class Writer extends Tool {
  name = "write";
  description = "Writes content from research notes";
  schema = z.object({ notes: z.string() });

  async execute({ notes }) {
    const response = await createLLM({ provider: "anthropic" })
      .chat("claude-sonnet-4-20250514")
      .system("Write a concise article from these notes.")
      .ask(notes);
    return response.content;
  }
}

// Coordinator orchestrates the flow
const coordinator = createLLM({ provider: "openai" })
  .chat("gpt-4o")
  .system("First research the topic, then write an article.")
  .withTools([Researcher, Writer]);

await coordinator.ask("Write about TypeScript 5.4 features");
```

---

## Parallel Execution

Node.js is async-native. Use `Promise.all()` to run independent LLM calls concurrently.

```typescript
import { createLLM } from "@node-llm/core";

async function analyzeContent(text: string) {
  const llm = createLLM({ provider: "openai" });

  const [sentiment, summary, topics] = await Promise.all([
    llm.chat("gpt-4o-mini").ask(`Sentiment (positive/negative/neutral): ${text}`),
    llm.chat("gpt-4o-mini").ask(`One-sentence summary: ${text}`),
    llm.chat("gpt-4o-mini").ask(`Extract 3 topics: ${text}`)
  ]);

  return {
    sentiment: sentiment.content,
    summary: summary.content,
    topics: topics.content
  };
}
```

---

## Supervisor Pattern

Run specialized reviewers in parallel, then synthesize their findings:

```typescript
import { createLLM } from "@node-llm/core";

async function reviewCode(code: string) {
  // Parallel specialist reviews
  const [security, performance] = await Promise.all([
    createLLM({ provider: "anthropic" })
      .chat("claude-sonnet-4-20250514")
      .system("Security review. List vulnerabilities.")
      .ask(code),
    createLLM({ provider: "openai" })
      .chat("gpt-4o")
      .system("Performance review. List bottlenecks.")
      .ask(code)
  ]);

  // Synthesize
  return createLLM({ provider: "openai" })
    .chat("gpt-4o")
    .system("Combine these reviews into actionable recommendations.")
    .ask(`Security:\n${security.content}\n\nPerformance:\n${performance.content}`);
}
```

---

## Error Handling in Agents

Agents should handle failures gracefully. See the [Tools guide](../core-features/tools.html#error-handling--flow-control-) for details.

```typescript
class RiskyTool extends Tool {
  async execute(args) {
    // Recoverable: return error for LLM to retry
    if (!args.query) {
      return { error: "Query is required" };
    }

    // Fatal: stop the entire agent loop
    if (args.query.includes("DROP TABLE")) {
      throw new ToolError("Blocked dangerous query", this.name, true);
    }

    return await this.doWork(args);
  }
}
```

---

## Next Steps

- [HR Chatbot RAG](https://github.com/node-llm/node-llm/tree/main/examples/applications/hr-chatbot-rag) — Full RAG implementation with Prisma + pgvector
- [Brand Perception Checker](https://github.com/node-llm/node-llm/tree/main/examples/applications/brand-perception-checker) — Multi-tool agent with web search
- [Tool Calling Guide](../core-features/tools.html) — Deep dive on tool patterns and safety
