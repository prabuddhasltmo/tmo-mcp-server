/**
 * TMO MCP — Remote HTTP Server
 *
 * Implements the MCP Streamable HTTP transport so the server can be deployed
 * once and shared across the whole company. Each connection carries its own
 * TMO credentials via request headers:
 *
 *   X-TMO-Token:     <api token>
 *   X-TMO-Database:  <company database name>
 *   X-TMO-Region:    us | ca | aus   (optional, defaults to "us")
 *
 * Claude Desktop config (per user):
 * {
 *   "mcpServers": {
 *     "tmo-api": {
 *       "url": "https://your-deployed-url.com/mcp",
 *       "headers": {
 *         "x-tmo-token":    "YOUR_TOKEN",
 *         "x-tmo-database": "YOUR_DATABASE"
 *       }
 *     }
 *   }
 * }
 *
 * Run locally:   node dist/http-server.js
 * PORT env var   controls the port (default 3000).
 */

import { randomUUID } from "node:crypto";
import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { TmoClient } from "./client.js";
import { registerAllTools } from "./register-tools.js";
import type { Region } from "./config.js";

const PORT = Number(process.env.PORT ?? 3000);
const app = express();
app.use(express.json());

// ── Health check ────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", server: "tmo-api", version: "1.0.0" });
});

// ── MCP endpoint ─────────────────────────────────────────────────────────────
app.all("/mcp", async (req, res) => {
  // Read credentials from request headers
  const token    = (req.headers["x-tmo-token"]    as string | undefined)?.trim();
  const database = (req.headers["x-tmo-database"] as string | undefined)?.trim();
  const region   = ((req.headers["x-tmo-region"]  as string | undefined)?.trim() ?? "us") as Region;

  if (!token || !database) {
    res.status(401).json({
      error: "Missing credentials. Provide X-TMO-Token and X-TMO-Database headers.",
    });
    return;
  }

  // Each connection gets its own isolated client + server
  const client = new TmoClient({ token, database, region, pageSize: 100 });
  const server = new McpServer({ name: "tmo-api", version: "1.0.0" });
  registerAllTools(server, client);

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
  });

  // Clean up when the connection closes
  res.on("close", () => {
    transport.close().catch(() => {});
    server.close().catch(() => {});
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.listen(PORT, () => {
  console.log(`✅  TMO MCP HTTP server listening on port ${PORT}`);
  console.log(`    Health:  http://localhost:${PORT}/health`);
  console.log(`    MCP:     http://localhost:${PORT}/mcp`);
});
