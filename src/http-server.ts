/**
 * TMO MCP — Remote HTTP Server (API key auth)
 *
 * A single API_KEY env var protects the endpoint — no OAuth, no portal.
 * TMO credentials can be set via env vars OR switched at runtime using
 * the tmo_set_credentials / tmo_switch_profile tools inside Claude.
 *
 * Env vars:
 *   API_KEY      – shared secret; clients send as  Authorization: Bearer <key>
 *   TMO_TOKEN    – (optional) TMO API token; can be set via tmo_set_credentials
 *   TMO_DATABASE – (optional) TMO database name; can be set via tmo_set_credentials
 *   TMO_REGION   – us | ca | aus  (default: us)
 *   PORT         – port (default: 3000)
 *
 * Named profiles (optional):
 *   TMO_TOKEN_<NAME> / TMO_DATABASE_<NAME>  →  tmo_switch_profile profile="<name>"
 *   e.g. TMO_TOKEN_PROD / TMO_DATABASE_PROD →  tmo_switch_profile profile="prod"
 *
 * Adding to Claude (Settings → Integrations → Add custom integration):
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

const PORT       = Number(process.env.PORT ?? 3000);
const API_KEY    = process.env.API_KEY;
const TMO_REGION = (process.env.TMO_REGION ?? "us") as Region;

// ── Shared client — persists across requests so tmo_set_credentials /
//    tmo_switch_profile changes survive for the life of the server process.
//    Token and database start empty if env vars are not set; use
//    tmo_set_credentials inside Claude to configure them at runtime.
const sharedClient = new TmoClient({
  token:    process.env.TMO_TOKEN    ?? "",
  database: process.env.TMO_DATABASE ?? "",
  region:   TMO_REGION,
  pageSize: 100,
});

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

  // All requests share one client — credential changes made via tools persist
  const server = new McpServer({ name: "tmo-api", version: "1.0.0" });
  registerAllTools(server, sharedClient);

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
