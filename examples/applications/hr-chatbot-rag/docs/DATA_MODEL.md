# NodeLLM Data Model & Architecture

This document explains the mental model behind the CRUD schema used in this application.

## Overview

The schema is designed to separate **State** (Chat/Message) from **Execution** (ToolCalls/Requests).

| Model | Concept |
|---|---|
| `AssistantChat` | **The Session context.** Holds configuration & system prompts. |
| `AssistantMessage` | **The Narrative.** What the user and assistant actually *said*. |
| `AssistantToolCall` | **The Actions.** What the assistant *did* (e.g., database search). |
| `AssistantRequest` | **The Bill.** Audit log of every API call & cost. |

---

## 1. AssistantChat (Session)
**Mental Model:** A container for a single conversation thread. It holds the "Rules of Engagement" (System Instructions) and the "Configuration" (Provider/Model).

**Example:**
```json
{
  "id": "chat_123",
  "instructions": "You are a helpful HR Assistant. Answer using the Employee Handbook.",
  "provider": "openai",
  "model": "gpt-4o",
  "metadata": { "userId": "user_456" }
}
```

---

## 2. AssistantMessage (Narrative)
**Mental Model:** A chronological entry in the conversation. This is what you render in the UI. It represents the *final, consolidated* output of a turn.

**Example (User):**
```json
{
  "role": "user",
  "content": "What is the vacation policy?"
}
```

**Example (Assistant):**
```json
{
  "role": "assistant",
  "content": "You get 20 days of PTO per year.",
  "inputTokens": 1500,
  "outputTokens": 50,
  "reasoning": "Retrieved doc 'policy.pdf' and extracted PTO section."
}
```

---

## 3. AssistantToolCall (Actions)
**Mental Model:** A side-effect performed by the assistant *during* the generation of a message. These are intermediate steps usually hidden from the user but critical for debugging logic.

**Use Case:** The assistant decides to "Act" before it "Speaks".

**Example:**
*User asks: "Who is the CEO?"*
1. Assistant *thinks*: "I need to search for the CEO." -> **Tool Call**
2. **AssistantToolCall Record:**
   ```json
   {
     "name": "search_documents",
     "arguments": "{\"query\": \"CEO name\"}",
     "toolCallId": "call_abc123"
   }
   ```
3. Tool executes and returns "John Doe".
4. Assistant *speaks*: "The CEO is John Doe." -> **AssistantMessage Record**

---

## 4. AssistantRequest (Audit / Infrastructure)
**Mental Model:** The raw invoice and flight recorder. This table tracks the **physical** HTTP requests sent to the LLM provider.

**Why is it different from Messages?**
A single "Message" (Turn) might require **multiple** "Requests" (Round-trips).
*Loop Example:*
1. Request 1 (LLM): Calls Tool A.
2. Request 2 (LLM): Calls Tool B.
3. Request 3 (LLM): Final Answer.

All 3 requests map to **one** `AssistantMessage` (the final answer), but `AssistantRequest` logs all 3 individually for cost tracking.

**Example:**
```json
{
  "provider": "openai",
  "model": "gpt-4o",
  "statusCode": 200,
  "duration": 450, // ms
  "inputTokens": 800,
  "outputTokens": 20,
  "cost": 0.002
}
```
