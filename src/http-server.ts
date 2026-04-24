/**
 * TMO MCP — Remote HTTP Server (API key auth)
 *
 * A single API_KEY env var protects the endpoint — no OAuth, no portal.
 * TMO credentials are set server-side via env vars; every authenticated
 * user shares them.
 *
 * Env vars:
 *   API_KEY      – shared secret; clients send as  Authorization: Bearer <key>
 *   TMO_TOKEN    – TMO API token
 *   TMO_DATABASE – TMO database name
 *   TMO_REGION   – us | ca | aus  (default: us)
 *   PORT         – port (default: 3000)
 *
 * Adding to Claude (Admin Settings → Connectors → Add custom connector):
 *   URL:    https://tmo-mcp-server-production.up.railway.app/mcp
 *   Header: Authorization = Bearer <API_KEY>
 */

import { randomUUID } from "node:crypto";
import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { TmoClient } from "./client.js";
import { registerAllTools } from "./register-tools.js";
import type { Region } from "./config.js";

const PORT     = Number(process.env.PORT ?? 3000);
const API_KEY  = process.env.API_KEY;
const TMO_TOKEN    = process.env.TMO_TOKEN;
const TMO_DATABASE = process.env.TMO_DATABASE;
const TMO_REGION   = (process.env.TMO_REGION ?? "us") as Region;

if (!TMO_TOKEN)    throw new Error("TMO_TOKEN env var is required");
if (!TMO_DATABASE) throw new Error("TMO_DATABASE env var is required");

const app = express();
app.use(express.json());

// ── Health check (unauthenticated — safe for Railway uptime monitoring) ──────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", server: "tmo-api", version: "1.0.0" });
});

// ── MCP endpoint ─────────────────────────────────────────────────────────────
app.all("/mcp", async (req, res) => {
  // Validate API key if one is configured
  if (API_KEY) {
    const auth = req.headers["authorization"] ?? "";
    const provided = Array.isArray(auth) ? auth[0] : auth;
    if (provided.replace(/^Bearer\s+/i, "").trim() !== API_KEY) {
      res.status(401).json({ error: "Invalid or missing API key." });
      return;
    }
  }

  // Use server-side TMO credentials for every connection
  const client = new TmoClient({ token: TMO_TOKEN!, database: TMO_DATABASE!, region: TMO_REGION, pageSize: 100 });
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
