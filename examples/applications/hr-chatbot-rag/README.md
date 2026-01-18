# HR Chatbot with RAG 🤖

> **A complete, production-ready example** demonstrating NodeLLM's full capabilities: RAG, streaming, persistence, and real-time chat.

![HR Chatbot Screenshot](hr-chatbot.png)

## 🎯 What This Example Demonstrates

This is a **flagship example** showing how to build a sophisticated AI application with NodeLLM. Perfect for learning or as a starter template for your own projects.

### NodeLLM Core Features
- ✅ **Streaming Responses**: Real-time token delivery with `chat.askStream()`
- ✅ **Tool Calling**: Autonomous RAG with `searchDocumentsTool`
- ✅ **Multi-Provider**: Switch between OpenAI, Gemini, etc. via config
- ✅ **Structured Output**: Type-safe responses with Zod schemas

### @node-llm/orm Features
- ✅ **Chat Persistence**: Automatic message history with Prisma
- ✅ **Streaming Persistence**: Messages saved as they stream
- ✅ **JSON Metadata**: Native `Json` type for flexible metadata
- ✅ **Custom Fields**: Ready for `userId`, `projectId` (see schema)
- ✅ **Tool Call Tracking**: Audit log of every tool execution
- ✅ **API Metrics**: Request latency, tokens, cost tracking
- ✅ **Optional Persistence**: Configure what to persist

### Production Patterns
- ✅ **Next.js 14 App Router**: Modern React patterns
- ✅ **Vector Search**: PostgreSQL + pgvector for RAG
- ✅ **Testing**: Vitest with database integration tests
- ✅ **Type Safety**: Full TypeScript throughout
- ✅ **Clean Architecture**: Separated concerns (models, services, tools)

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **AI Engine**: [@node-llm/core](https://github.com/node-llm/node-llm)
- **Persistence**: [@node-llm/orm](https://github.com/node-llm/node-llm/tree/main/packages/orm)
- **Database**: PostgreSQL 15+ with `pgvector` extension
- **Embeddings**: OpenAI `text-embedding-3-small`
- **Styling**: Tailwind CSS + Ant Design
- **Testing**: Vitest

## 🏁 Getting Started

### 1. Clone & Install
```bash
# If you haven't cloned NodeLLM yet
git clone https://github.com/node-llm/node-llm.git
cd node-llm/examples/applications/hr-chatbot-rag

# Install dependencies
npm install
```

### 2. Configure Environment
Copy the example environment file and fill in your API keys:
```bash
cp .env.example .env
```

Edit `.env`:
```bash
# PostgreSQL Connection URL (Local Example)
# NOTE: The migration automatically enables the "vector" extension.
DATABASE_URL="postgresql://user:password@localhost:5432/hr_chatbot?schema=public"
OPENAI_API_KEY="sk-..."
```

### 3. Setup Database
```bash
# Generate Prisma Client
npm run postinstall

# Run migrations (Reset if needed to ensure clean state)
npx prisma migrate dev --name init
```

### 4. Seed HR Policies
Populate the vector database with sample HR policies:
```bash
npm run seed
```

### 5. Run the App
```bash
npm run dev
```
Visit `http://localhost:3002` (or the port shown in terminal) to chat.

### 🔄 Switching Providers (e.g., Gemini)

You can switch the underlying AI provider without changing code by updating your `.env` file.

**Important**: If you switch providers, you **MUST** re-seed the database because embedding vectors are provider-specific.

1.  **Update `.env`**:
    ```bash
    NODELLM_PROVIDER="gemini"
    NODELLM_MODEL="gemini-1.5-flash"
    GEMINI_API_KEY="your-gemini-key"
    ```

2.  **Re-seed Database** (Regenerates embeddings):
    ```bash
    npm run seed
    ```

3.  **Restart App**:
    ```bash
    npm run dev
    ```

## 🧪 Testing

### Run Unit & Integration Tests
```bash
npm test
```

### Test in Console (CLI)
You can test the RAG flow without the UI using the console script:
```bash
npm run console
```
Then try running:
```typescript
const { AssistantChat } = await import("./src/models/assistant-chat");
const chat = await AssistantChat.create({ model: "gpt-4o", provider: "openai" });
await chat.ask("What is the remote work policy?");
```

## 🏗️ Architecture

### RAG Flow
1. **Ingestion**: Documents are chunked and embedded via `DocumentIngestion` service.
2. **Storage**: Chunks stored in `DocumentChunk` table using native `vector(1536)` type.
3. **Retrieval**: `searchDocumentsTool` queries PostgreSQL.
4. **Ranking**: Results ranked by hardware-accelerated cosine distance (`<=>` operator).
5. **Generation**: LLM uses retrieved context to answer.

### Data Model
The database schema consists of the following key tables:

| Table | Purpose |
|-------|---------|
| `AssistantChat` | Stores session metadata, model config, and system instructions. |
| `AssistantMessage` | The logical conversation history (User query + Assistant Answer). |
| `AssistantToolCall` | Audit log of every tool executed (args, names) during a turn. |
| `AssistantRequest` | *Optional.* Used for low-level API debugging (latency/cost per HTTP request). |

### Project Structure
```
src/
├── app/              # Next.js App Router pages
├── components/       # UI Components (Chat Interface)
├── models/           # Domain Models (AssistantChat)
├── services/         # Business Logic (Ingestion, Search)
├── tools/            # NodeLLM Tools (RAG Tool)
└── data/             # Sample Data (HR Policies)
```

## 📝 License

MIT - Feel free to use this as a template for your own projects!
