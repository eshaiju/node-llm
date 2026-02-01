---
layout: default
title: Dashboard
parent: Monitor & Observability
nav_order: 2
permalink: /monitor/dashboard
description: Built-in web dashboard for visualizing LLM usage, costs, and performance metrics.
---

# {{ page.title }}
{: .no_toc }

{{ page.description }}
{: .fs-6 .fw-300 }

![Dashboard Metrics View](/assets/images/monitor/dashboard-metrics.png)

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Overview

The NodeLLM Monitor Dashboard is a production-ready UI that visualizes your LLM telemetry. Unlike other tools that require external services, this dashboard is **embedded directly into your application** as a middleware or route handler.

It provides:
- **Real-time Metrics**: Costs, token usage, and latency.
- **Trace Explorer**: Inspect full request/response payloads.
- **Provider Breakdown**: Compare models and providers.
- **Time-Series Analysis**: Visual trends over time.

---

## Integration

### Express / Fastify / Node.js HTTP

Use `createMonitorMiddleware` to mount the dashboard on any Express-compatible server:

```typescript
import express from "express";
import { Monitor, MemoryAdapter } from "@node-llm/monitor";
import { createMonitorMiddleware } from "@node-llm/monitor/ui";

const app = express();

// 1. Setup Monitor
const store = new MemoryAdapter();
const monitor = new Monitor({ store });

// 2. Mount Dashboard (share the same store)
app.use(createMonitorMiddleware(store, { basePath: "/monitor" }));

app.listen(3001, () => {
  console.log("Dashboard at http://localhost:3001/monitor");
});
```

### Next.js App Router

Use `createMonitoringRouter` to create a standard Web API route handler:

```typescript
// app/api/monitor/[...path]/route.ts
import { PrismaClient } from "@prisma/client";
import { PrismaAdapter } from "@node-llm/monitor";
import { createMonitoringRouter } from "@node-llm/monitor/ui";

const prisma = new PrismaClient();
const adapter = new PrismaAdapter(prisma);

const { GET, POST } = createMonitoringRouter(adapter, {
  basePath: "/api/monitor",
});

export { GET, POST };
```

For the UI pages, you can either serve them via this API route (SPAs) or build a custom page that consumes these endpoints.

---

## Configuration

The dashboard factories accept an options object:

```typescript
interface MonitorDashboardOptions {
  /** Base path for mounting. Default: "/monitor" */
  basePath?: string;
  
  /** CORS configuration for API endpoints */
  cors?: boolean | string | string[];
  
  /** Polling interval (ms) for the UI. Default: 5000 */
  pollInterval?: number;
}
```

### Authentication

Since the dashboard is just middleware, you can use standard authentication patterns:

```typescript
import { basicAuth } from "./auth-middleware";

// Protect the dashboard route
app.use("/monitor", basicAuth);
app.use(createMonitorMiddleware(store, { basePath: "/monitor" }));
```

---

## Standalone Server

If you prefer to run the dashboard as a separate service (e.g., to view production logs locally), you can create a simple server script:

```typescript
// dashboard-server.ts
import { createServer } from "node:http";
import { FileAdapter } from "@node-llm/monitor";
import { MonitorDashboard } from "@node-llm/monitor/ui";

const adapter = new FileAdapter("./production-logs.json");
const dashboard = new MonitorDashboard(adapter, { basePath: "/" });

const server = createServer(async (req, res) => {
  await dashboard.handleRequest(req, res);
});

server.listen(3001, () => {
  console.log("Dashboard at http://localhost:3001");
});
```

See `examples/dashboard.ts` in the repository for a complete implementation.

---

## API Endpoints

The dashboard backend exposes these endpoints (relative to your `basePath`):

| Endpoint | Method | Description | Params |
|----------|--------|-------------|--------|
| `/api/stats` | GET | Aggregate statistics | `from` (Date) |
| `/api/metrics` | GET | Time-series data for charts | `from` (Date) |
| `/api/traces` | GET | List of request traces | `limit`, `offset` |
| `/api/events` | GET | Detailed events for a request | `requestId` (Required) |

### Example Query

```bash
# Get traces
curl "http://localhost:3001/monitor/api/traces?limit=10"

# Get specific request details
curl "http://localhost:3001/monitor/api/events?requestId=req_12345"
```


