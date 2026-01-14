# Multi-Provider Brand Auditor (NodeLLM Reference)

A production-grade, infrastructure-first diagnostic tool designed for Node.js architects. This application demonstrates the advanced capabilities of **NodeLLM v1.5.2**, transitioning from simple "AI chat" to a deterministic **System Protocol** for brand intelligence and market validation.

---

## 🛠 Architectural Showcase
Built to serve as a high-fidelity reference implementation for enterprise LLM integration:

- **Protocol-Driven Orchestration**: Uses `NodeLLM` to manage parallel semantic traces across multiple provider nodes (OpenAI, Anthropic).
- **Native Structured Output**: Strict schema enforcement via `withSchema()` (Zod) ensures 100% protocol-level compliance for downstream automated processing.
- **Security & Compliance Hooks**: Demonstrates `beforeRequest` sanitization (PII redaction) and comprehensive `afterResponse` auditing.
- **Reasoning-Aware Intelligence**: Direct capture and display of advanced model "thought processes" (e.g., OpenAI o3-mini) before output finalization.
- **Tool-Calling Agent**: Orchestrates a `MarketDataTool` agent to synthesize live SERP data into refined market presence indicators.

## 🚀 Technical Features
- **Semantic Trace Analysis**: Extracts intrinsic training-data weights for a brand across `gpt-4o`, `claude-haiku-3`, and `o3-mini`.
- **Live Market Snapshot**: Real-time retrieval of "People Also Ask" questions and SERP proximity vectors via `Serper.dev`.
- **Latency & Resource Telemetry**: Direct visibility into token consumption, matching probability, and system-level latency.
- **Bento-Grid Diagnostic UI**: A premium, "Node Architect" aesthetic using Node.js Green accents, monospace typography, and a "System Log" visual style.

## 📦 Setup & Deployment

### 1. Environmental Configuration
Create a `.env` file in the `server/` directory with the following variables:

```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-...
SERPER_API_KEY=xxx... # Required for live market data
```

### 2. Infrastructure Initialization
```bash
# Register system dependencies
npm install

# Start the Audit Server (Default Port: 3001)
cd server && npm start

# Initialize Analytics Dashboard
cd app && npm run dev
```

## 🧠 How it Works: The Protocol Logic
Unlike standard "AI wrappers," this auditor follows a strict **System Protocol**:
1. **Intrinsic Extraction**: Queries the models' weights using a `PROTOCOL_AUDIT_SCOPE` directive to see what the world's digital memory thinks of a brand.
2. **Web Vector Analysis**: Deploys a research agent to crawl live web snippets and identify the current market "Vibe."
3. **Semantic Alignment**: Performs a deterministic cross-validation to identify the "Truth Gap" between training data and live data.
4. **Transparency Layer**: Provides full traceability into how each conclusion was reached, including raw snippets and model reasoning.

---
Built by **Node Architects** using the **NodeLLM System Core**.
*Licensed for Enterprise Audit and Diagnostic Use.*
