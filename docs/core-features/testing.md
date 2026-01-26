---
layout: default
title: Testing
parent: Core Features
nav_order: 10
permalink: /core-features/testing
description: Deterministic testing infrastructure for NodeLLM applications. VCR integration and fluent mocking for reliable AI systems.
---

# Testing with @node-llm/testing
{: .no_toc }

Deterministic testing infrastructure for NodeLLM-powered AI systems. Built for engineers who prioritize **Boring Solutions**, **Security**, and **High-Fidelity Feedback Loops**.

---

## The Philosophy: Two-Tier Testing

We believe AI testing should never be flaky or expensive. We provide two distinct strategies:

### 1. VCR (Integration Testing) 📼

**When to use**: To verify your system works with real LLM responses without paying for every test run.

- **High Fidelity**: Captures the **NodeLLM-normalized LLM execution** (model, prompt, tools, retries, and final output), ensuring replay remains stable even if provider APIs change.
- **Security First**: Automatically scrubs API Keys and sensitive PII from "cassettes".
- **CI Safe**: Fails-fast in CI if a cassette is missing, preventing accidental live API calls.
 
 > 🚨 **CI Safety Guarantee**
 > When `CI=true`, VCR **will never** record new cassettes.
 > If a matching cassette is missing or mismatched, the test fails immediately.

### 2. Mocker (Unit Testing) 🎭
 
 > ⚠️ **Note**
 > The Mocker does **not** attempt to simulate model intelligence or reasoning.
 > It deterministically simulates provider responses to validate application logic, error handling, and control flow.

**When to use**: To test application logic, edge cases (errors, rate limits), and rare tool-calling paths.

- **Declarative**: Fluent API to define expected prompts and responses.
- **Multimodal**: Native support for `chat`, `embed`, `paint`, `transcribe`, and `moderate`.
- **Streaming**: Simulate token-by-token delivery to test real-time UI logic.

---

## 📼 VCR Usage

### Basic Interaction

Wrap your tests in `withVCR` to automatically record interactions the first time they run.

```typescript
import { withVCR } from "@node-llm/testing";

it(
  "calculates sentiment correctly",
  withVCR(async () => {
    const result = await mySentimentAgent.run("I love NodeLLM!");
    expect(result.sentiment).toBe("positive");
  })
);
```

### Hierarchical Organization (Convention-Based Mode) 📂

Organize your cassettes into nested subfolders to match your test suite structure.

```typescript
import { describeVCR, withVCR } from "@node-llm/testing";

describeVCR("Authentication", () => {
  describeVCR("Login", () => {
    it(
      "logs in successfully",
      withVCR(async () => {
        // Cassette saved to: test/cassettes/authentication/login/logs-in-successfully.json
      })
    );
  });
});
```

### Security & Scrubbing 🛡️

The VCR automatically redacts `api_key`, `authorization`, and other sensitive headers. You can add custom redaction:

```typescript
withVCR({
  // Redact by key name
  sensitiveKeys: ["user_ssn", "stripe_token"],
  
  // Redact by value pattern (Regex)
  sensitivePatterns: [/sk-test-[0-9a-zA-Z]+/g],
  
  // Advanced: Custom function hook
  scrub: (data) => data.replace(/SSN: \d+/g, "[REDACTED_SSN]")
}, async () => { ... });
```
### Global Configuration 🌍

Instead of repeating configuration in every test, set global defaults in your test setup file:

```typescript
import { configureVCR } from "@node-llm/testing";

configureVCR({
  cassettesDir: "test/__cassettes__", // Configurable global path
  sensitiveKeys: ["user_ssn", "stripe_token"],
  sensitivePatterns: [/sk-test-[0-9a-zA-Z]+/g]
});
```

### Per-Test Overrides

You can still override defaults on a per-test basis:

```typescript
withVCR({
  // Merged with global config
  sensitiveKeys: ["specific_secret"] 
}, async () => { ... });
```
---

## 🎭 Mocker Usage

### Fluent Mocking

Define lightning-fast, zero-network tests for your agents.

```typescript
import { mockLLM } from "@node-llm/testing";

const mocker = mockLLM();

// Exact match
mocker.chat("Ping").respond("Pong");

// Regex match
mocker.chat(/hello/i).respond("Greetings!");

// Simulate a Tool Call
mocker.chat("What's the weather?").callsTool("get_weather", { city: "London" });
```

### Streaming Mocks 🌊

Test your streaming logic by simulating token delivery.

```typescript
mocker.chat("Tell a story").stream(["Once ", "upon ", "a ", "time."]);
```

### Multimodal Mocks 🎨

```typescript
mocker.paint(/a cat/i).respond({ url: "https://mock.com/cat.png" });
mocker.embed("text").respond({ vectors: [[0.1, 0.2, 0.3]] });
```

---

## ⚙️ Configuration Contract

| Env Variable       | Description                                                | Default          |
| ------------------ | ---------------------------------------------------------- | ---------------- |
| `VCR_MODE`         | `record`, `replay`, `auto`, or `passthrough`               | `auto`           |
| `VCR_CASSETTE_DIR` | Base directory for cassettes                               | `test/cassettes` |
| `CI`               | When true, VCR prevents recording and forces exact matches | (Auto-detected)  |

---

## 🏛️ Integration with @node-llm/orm

The testing tools operate at the `providerRegistry` level. This means they **automatically** intercept LLM calls made by the ORM layer.

### Pattern: Testing Database Persistence

When using `@node-llm/orm`, you can verify both the database state and the LLM response in a single test.

```typescript
import { withVCR } from "@node-llm/testing";
import { createChat } from "@node-llm/orm/prisma";

it(
  "saves the LLM response to the database",
  withVCR(async () => {
    // 1. Setup ORM Chat
    const chat = await createChat(prisma, llm, { model: "gpt-4" });

    // 2. Interaction (VCR intercepts the LLM call)
    await chat.ask("Hello ORM!");

    // 3. Verify DB state (standard Prisma/ORM assertions)
    const messages = await prisma.assistantMessage.findMany({
      where: { chatId: chat.id }
    });

    expect(messages).toHaveLength(2); // User + Assistant
    expect(messages[1].content).toBeDefined();
  })
);
```

### Pattern: Mocking Rare Logic

Use the `Mocker` to test how your application handles complex tool results or errors without setting up a real LLM.

```typescript
import { mockLLM } from "@node-llm/testing";

it("handles tool errors in ORM sessions", async () => {
  const mocker = mockLLM();
  mocker.chat("Search docs").respond({ error: new Error("DB Timeout") });

  const chat = await loadChat(prisma, llm, "existing-id");

  await expect(chat.ask("Search docs")).rejects.toThrow("DB Timeout");
});
```

---

## 🏛️ Architecture Contract

- **No Side Effects**: Mocks and VCR interceptors are automatically cleared after each test turn.
- **Deterministic**: The same input MUST always yield the same output in Replay mode.
- **Explicit > Implicit**: We prefer explicit mock definitions over complex global state.
 
 ---
 
 ## 🛑 When Not to Use @node-llm/testing
 
 - Do not use **VCR** for rapid prompt iteration — use live calls instead.
 - Do not use **Mocker** to validate response quality or correctness.
 - Do not commit **cassettes** for experimental or throwaway prompts.
