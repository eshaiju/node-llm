# Changelog

All notable changes to `@node-llm/orm` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-01-18

### Added

- **Chat Persistence**: Automatic tracking of chat sessions, messages, and conversation history
- **Streaming Support**: Full support for `chat.askStream()` with automatic message persistence as tokens arrive
- **Custom Fields Support**: Pass additional fields (e.g., `userId`, `projectId`) directly to `createChat()` - they're automatically spread into the Prisma create call
- **Native JSON Metadata**: Metadata passed as-is to support native `Json`/`JSONB` database types for efficient querying
- **Optional Persistence Configuration**: New `persistence` option allows selective disabling of tool call and request tracking
  - `persistence.toolCalls`: Enable/disable tool call persistence (default: `true`)
  - `persistence.requests`: Enable/disable API request metrics (default: `true`)
- **Tool Call Tracking**: Audit log of every tool execution with arguments and results
- **API Request Metrics**: Track latency, tokens, and cost for every API call
- **Custom Table Names**: Support for custom Prisma table names
- **Comprehensive Tests**: 24 unit tests covering all features
- **Example Application**: Complete HR Chatbot RAG example demonstrating all ORM features
- **TypeScript Support**: Full type safety with Prisma and TypeScript
- **Prisma Adapter**: Production-ready adapter for Prisma ORM

### Example Usage

```typescript
// Custom fields
const chat = await createChat(prisma, llm, {
  model: "gpt-4",
  userId: "user_123",
  projectId: "proj_456",
  metadata: { source: "web-ui", tags: ["support"] }
});

// Optional persistence
const chat = await createChat(prisma, llm, {
  model: "gpt-4",
  persistence: {
    toolCalls: false, // Skip tool call tracking
    requests: true // Keep request metrics
  }
});

// Streaming with persistence
for await (const token of chat.askStream("Hello")) {
  process.stdout.write(token);
}
// Messages automatically persisted after stream completes
```

## [Unreleased]

### Planned

- Support for custom message types
- Batch operations for message history
- Advanced query helpers

---

[0.1.0]: https://github.com/node-llm/node-llm/releases/tag/orm-v0.1.0
