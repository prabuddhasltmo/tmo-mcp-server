import { z } from "zod";
import type { TmoClient } from "../client.js";
import { getProfiles } from "../config.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerCredentialsTools(server: McpServer, client: TmoClient) {

  // ── Get current credentials ────────────────────────────────────────────────

  server.tool(
    "tmo_get_credentials",
    "Show the active TMO API credentials (token is masked for security)",
    {},
    async () => {
      const cfg = client.getPublicConfig();
      return {
        content: [{
          type: "text",
          text: [
            "**Active TMO credentials**",
            `  Token:    ${cfg.token}`,
            `  Database: ${cfg.database}`,
            `  Region:   ${cfg.region}`,
            `  Base URL: ${cfg.baseUrl}`,
          ].join("\n"),
        }],
      };
    }
  );

  // ── Set credentials manually ───────────────────────────────────────────────

  server.tool(
    "tmo_set_credentials",
    "Update the active TMO API token, database, and/or region without restarting the server. "
    + "Only the fields you supply are changed; omit a field to keep its current value.",
    {
      token:    z.string().optional().describe("API token assigned by Applied Business Software"),
      database: z.string().optional().describe("Company database name (e.g. '001-5533-000-AM Team')"),
      region:   z.enum(["us", "ca", "aus"]).optional().describe("API region (default: us)"),
    },
    async ({ token, database, region }) => {
      if (!token && !database && !region) {
        return { content: [{ type: "text", text: "⚠️  No fields provided — nothing changed." }] };
      }

      client.updateConfig({ token, database, region });
      const cfg = client.getPublicConfig();

      return {
        content: [{
          type: "text",
          text: [
            "✅ Credentials updated.",
            `  Token:    ${cfg.token}`,
            `  Database: ${cfg.database}`,
            `  Region:   ${cfg.region}`,
            `  Base URL: ${cfg.baseUrl}`,
          ].join("\n"),
        }],
      };
    }
  );

  // ── List available profiles ────────────────────────────────────────────────

  server.tool(
    "tmo_list_profiles",
    "List all credential profiles available to switch to. "
    + "The built-in 'sandbox' profile is always present. "
    + "Additional profiles are defined via env vars: TMO_TOKEN_<NAME> and TMO_DATABASE_<NAME>.",
    {},
    async () => {
      const profiles = getProfiles();
      const lines = profiles.map(p => {
        const t = p.token;
        const masked = t.length <= 3 ? "*".repeat(t.length) : t.slice(0, 2) + "*".repeat(t.length - 2);
        return `  • ${p.name.padEnd(16)}  Token: ${masked.padEnd(12)}  Database: ${p.database}  Region: ${p.region}`;
      });
      return {
        content: [{
          type: "text",
          text: ["**Available profiles**\n", ...lines].join("\n"),
        }],
      };
    }
  );

  // ── Switch to a named profile ──────────────────────────────────────────────

  server.tool(
    "tmo_switch_profile",
    "Switch to a named credential profile in one step. "
    + "Use 'tmo_list_profiles' to see what profiles are available. "
    + "The built-in profile name 'sandbox' always works (Token=TMO, Database=API Sandbox).",
    {
      profile: z.string().describe("Profile name to activate (case-insensitive)"),
    },
    async ({ profile }) => {
      const profiles = getProfiles();
      const match = profiles.find(p => p.name.toLowerCase() === profile.trim().toLowerCase());
      if (!match) {
        const names = profiles.map(p => `'${p.name}'`).join(", ");
        return {
          content: [{
            type: "text",
            text: `❌ Profile '${profile}' not found.\nAvailable: ${names}`,
          }],
        };
      }

      client.updateConfig({ token: match.token, database: match.database, region: match.region });
      const cfg = client.getPublicConfig();

      return {
        content: [{
          type: "text",
          text: [
            `✅ Switched to profile '${match.name}'.`,
            `  Token:    ${cfg.token}`,
            `  Database: ${cfg.database}`,
            `  Region:   ${cfg.region}`,
            `  Base URL: ${cfg.baseUrl}`,
          ].join("\n"),
        }],
      };
    }
  );
}
