---
layout: default
title: Security & Compliance
parent: Advanced
nav_order: 1
---

# Security & Compliance

NodeLLM is built from the ground up to be an **architectural security layer**. In production AI applications, the LLM is often the most vulnerable component due to prompt injection, instruction drift, and potential PII leakage. 

NodeLLM provides several "Zero-Config" and pluggable security features to mitigate these risks.

---

## 🧱 Smart Context Isolation

The most common vector for LLM vulnerabilities is **Instruction Injection**, where user input tricks the model into ignoring its system instructions.

NodeLLM solves this by maintaining a strict architectural boundary between **System Instructions** and **Conversation History**.

- **Isolation**: Instructions are stored separately from the user message stack. They are never interleaved in a way that allows a user to "close" a system block.
- **Priority**: When sending a payload to a provider, NodeLLM ensures instructions are placed in the most authoritative role available.
- **Drift Protection**: Even in long conversations with many turns, NodeLLM continuously re-asserts the system context as the primary authority.

---

## 🛡️ Content Policy Hooks

NodeLLM allows you to inject security and compliance policies at the **edge** of the request/response cycle using asynchronous hooks.

### `beforeRequest` (Input Guardrail)
Intercept messages before they reach the LLM. Use this for **PII Detection** and **Redaction**.

```ts
chat.beforeRequest(async (messages) => {
  for (const msg of messages) {
    if (typeof msg.content === "string") {
      msg.content = msg.content.replace(/\d{3}-\d{2}-\d{4}/g, "[REDACTED_SSN]");
    }
  }
  return messages;
});
```

### `afterResponse` (Output Guardrail)
Verify the LLM's output before it reaches your application logic. Use this for **Compliance Verification** or **Sensitive Data Masking**.

```ts
chat.afterResponse(async (response) => {
  if (response.content.includes("SECRET_API_KEY")) {
    return response.withContent("Error: Sensitive data detected in output.");
  }
});
```

---

## 🔍 Observability as Security

Security in AI is not just about blocking; it's about **Auditing**. NodeLLM provides high-fidelity hooks for monitoring the entire lifecycle of tool executions, which are often the most sensitive part of an AI agent.

- **`onToolCallStart`**: Audit exactly what parameters the LLM is trying to send to your internal functions.
- **`onToolCallEnd`**: Record the raw data returned from your systems to the LLM.
- **`onToolCallError`**: Track failed attempts or malicious inputs that caused tool crashes.

```ts
chat
  .onToolCallStart((call) => auditLog.info(`Tool ${call.function.name} requested`))
  .onToolCallError((call, err) => incidentResponse.trigger(`Tool failure: ${err.message}`));
```

---

## ⚡ Smart Developer Role

Modern models (like OpenAI's **o1**, **o3**, and **GPT-4o**) have introduced a specialized `developer` role. This role has higher "Instruction Authority" than the standard `system` role.

NodeLLM **automatically detects** if a model supports this role. If it does, your system instructions are elevated to the `developer` role, making the model significantly more resistant to prompt injection and more likely to follow strict guidelines.

---

## 🔐 Privacy & Data Strategy

- **Stateless Architecture**: NodeLLM is a library, not a service. We do not store, log, or transmit your data to any third-party servers other than the providers you explicitly configure.
- **Local Sovereignty**: Since NodeLLM supports **Ollama**, you can run the entire stack (including security policies) on-premise without ever sending data over the internet.
- **Encapsulated History**: Conversation history is stored in-memory within the `Chat` instance and is only shared with the provider at the moment of a request.
