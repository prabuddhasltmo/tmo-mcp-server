/**
 * TMO MCP — Remote HTTP server (API key auth)
 *
 * Env vars (set in Railway):
 *   API_KEY      – bearer token clients send as  Authorization: Bearer <key>
 *   TMO_TOKEN    – default TMO token (optional if you always switch via tmo_switch_profile)
 *   TMO_DATABASE – default TMO database (optional)
 *   TMO_REGION   – us | ca | aus  (default: us)
 *   TMO_PROFILES – JSON object of named profiles, e.g.:
 *                  {"qa":{"token":"ABSWEB","database":"ABS QA Main"},
 *                   "prod":{"token":"...","database":"..."}}
 *   PORT         – port (default: 3000)
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

const PORT    = Number(process.env.PORT ?? 3000);
const API_KEY = process.env.API_KEY;

// Single shared client — credential switches via tmo_switch_profile persist
// for the lifetime of the server process (survive across requests).
const sharedClient = new TmoClient({
  token:    process.env.TMO_TOKEN    ?? "",
  database: process.env.TMO_DATABASE ?? "",
  region:   (process.env.TMO_REGION  ?? "us") as Region,
  pageSize: 100,
});

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", server: "tmo-api", version: "1.0.0" });
});

app.all("/mcp", async (req, res) => {
  if (API_KEY) {
    const provided = (Array.isArray(req.headers["authorization"])
      ? req.headers["authorization"][0]
      : req.headers["authorization"] ?? "");
    if (provided.replace(/^Bearer\s+/i, "").trim() !== API_KEY) {
      res.status(401).json({ error: "Invalid or missing API key." });
      return;
    }
  }

  const server = new McpServer({ name: "tmo-api", version: "1.0.0" });
  registerAllTools(server, sharedClient);

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
  });

  res.on("close", () => {
    transport.close().catch(() => {});
    server.close().catch(() => {});
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.listen(PORT, () => {
  console.log(`TMO MCP HTTP server on port ${PORT}`);
});
