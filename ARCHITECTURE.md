# NodeLLM Architecture Contract (v1.5.4+)

This document defines the **immutable architectural contract** for NodeLLM.  
These are the guarantees that will not change without a major version bump.

## Core Principles

### 1. Immutability by Default

**Contract**: `NodeLLM` is a default immutable instance created at startup.

```typescript
import { NodeLLM } from '@node-llm/core';

// ✅ NodeLLM is frozen and immutable
Object.isFrozen(NodeLLM); // true

// ❌ No mutation allowed
NodeLLM.provider = "openai"; // TypeError
NodeLLM.configure({ ... });  // NO-OP with deprecation warning
```

**Rationale**: Immutability prevents race conditions, enables safe concurrency, and makes behavior predictable in serverless/ORM contexts.

---

### 2. Provider Selection is Resolved at Startup

**Contract**: Environment variables are read **once** at instance creation time.

```typescript
// At module load time:
export const NodeLLM = createLLM(config); // Reads process.env NOW

// Later, changing env has NO effect:
process.env.OPENAI_API_KEY = "new-key";
NodeLLM.chat("gpt-4"); // Still uses OLD key (or none if not set initially)
```

**Implication**:

- Configuration is captured at construction
- No runtime env re-reading
- Predictable, testable behavior

---

### 3. Runtime Switching Happens via Context Branching

**Contract**: Runtime provider switching creates **new isolated instances**.

```typescript
// Pattern 1: Scoped instance
const openai = NodeLLM.withProvider("openai", {
  openaiApiKey: "..."
});

// Pattern 2: Fresh instance
const anthropic = createLLM({
  provider: "anthropic",
  anthropicApiKey: "..."
});

// ✅ Each instance is isolated
openai.chat("gpt-4"); // Uses OpenAI
anthropic.chat("claude-3"); // Uses Anthropic
```

**Rationale**: Avoids global state mutation while enabling flexible provider usage.

---

### 4. Provider ≠ Model

**Contract**: Model names do NOT imply provider selection.

```typescript
// ❌ This does NOT auto-switch to Anthropic:
NodeLLM.chat("claude-3-5-sonnet");
// Throws: ProviderNotConfiguredError (if no provider set)

// ✅ Explicit provider required:
const llm = NodeLLM.withProvider("anthropic", { ... });
llm.chat("claude-3-5-sonnet"); // Works
```

**Rationale**:

- Prevents "magic" behavior
- Makes provider selection explicit
- Avoids ambiguity (e.g., "gpt-4" via OpenAI vs OpenRouter)

---

### 5. History Belongs to Chat, Not Provider

**Contract**: Conversation history is scoped to `Chat` instances, not providers.

```typescript
const chat1 = llm.chat("gpt-4");
await chat1.ask("Hello");
await chat1.ask("Follow-up"); // Has context from "Hello"

const chat2 = llm.chat("gpt-4");
await chat2.ask("New conversation"); // Fresh context
```

**Rationale**: Enables multi-turn conversations without provider-level state pollution.

---

## Public API Surface (Stable)

These APIs are **locked** and will not change without a major version:

### Core Exports

```typescript
import {
  NodeLLM, // Default immutable instance
  createLLM, // Factory for custom instances
  NodeLLMCore, // Core class (for typing)
  LegacyNodeLLM // Deprecated shim
} from "@node-llm/core";
```

### Instance Methods

```typescript
// ✅ Stable public API
NodeLLM.chat(model?, options?)
NodeLLM.withProvider(name, config?)
NodeLLM.registerProvider(name, factory)
NodeLLM.embed(input, options?)
NodeLLM.transcribe(file, options?)
NodeLLM.moderate(input, options?)
NodeLLM.paint(prompt, options?)
NodeLLM.listModels()
```

### Chat Methods

```typescript
chat.ask(prompt, options?)
chat.stream(prompt, options?)
chat.withTools(tools)
chat.withSchema(schema)
chat.withInstructions(instructions)
chat.withTemperature(temp)
// ... (see Chat API docs)
```

---

## Error Contract

These errors are **public and stable**:

```typescript
import {
  ProviderNotConfiguredError, // No provider set
  UnsupportedFeatureError, // Provider lacks feature
  ModelCapabilityError, // Model lacks capability
  ServerError, // Provider API error
  RateLimitError, // Rate limit hit
  AuthenticationError // Invalid API key
} from "@node-llm/core";
```

**Contract**:

- Error names and semantics are stable
- New errors may be added (non-breaking)
- Existing error meanings will not change

---

## Extensibility Contract

### Custom Providers

**Contract**: NodeLLM is an **extensible platform**.

```typescript
import { BaseProvider, NodeLLM } from "@node-llm/core";

class MyProvider extends BaseProvider {
  // Implement required methods
}

// ✅ Public API for registration
NodeLLM.registerProvider("my-provider", () => new MyProvider());

// ✅ Use like built-in providers
const llm = createLLM({ provider: "my-provider" });
```

**Stability**:

- `registerProvider()` is public and stable
- `BaseProvider` interface is stable
- `providerRegistry` is internal (use `registerProvider` instead)

---

## What Can Still Change (Non-Breaking)

These are **implementation details** that may evolve:

- Internal provider implementations
- Performance optimizations
- Error messages (not error types)
- Default model selections
- Retry strategies
- Logging verbosity

---

## Migration Path

### From Mutable Singleton (v1.5.3 and earlier)

```typescript
// ❌ Old pattern (deprecated)
NodeLLM.configure({ provider: "openai", openaiApiKey: "..." });
const chat = NodeLLM.chat("gpt-4");

// ✅ New pattern (recommended)
const llm = createLLM({ provider: "openai", openaiApiKey: "..." });
const chat = llm.chat("gpt-4");

// ✅ Alternative (using default instance)
const llm = NodeLLM.withProvider("openai", { openaiApiKey: "..." });
const chat = llm.chat("gpt-4");
```

---

## Version Guarantees

- **Patch** (1.5.x): Bug fixes, no API changes
- **Minor** (1.x.0): New features, backward compatible
- **Major** (2.0.0): Breaking changes to this contract

---

## Freeze Checklist (Internal)

Before declaring architecture locked:

- [x] No global mutation possible
- [x] Provider ≠ model is clearly documented
- [x] Env is read once (at instance creation)
- [x] Runtime switching is context-based only
- [x] Errors are classified and intentional
- [x] Docs say exactly what the code enforces

**Status**: ✅ Architecture is **LOCKED** as of v1.5.4

---

_Last updated: 2026-01-16_  
_Contract version: 1.0_
