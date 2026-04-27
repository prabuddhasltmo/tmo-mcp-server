import { z } from "zod";
import type { TmoClient } from "../client.js";
import { getProfiles } from "../config.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerCredentialsTools(server: McpServer, client: TmoClient) {

  // ── List available profiles ────────────────────────────────────────────────

  server.tool(
    "tmo_list_profiles",
    "List all credential profiles available. "
    + "Profiles are defined in the TMO_PROFILES environment variable. "
    + "The built-in 'sandbox' profile is always present. "
    + "Call this to discover profile names before switching.",
    {},
    async () => {
      const profiles   = getProfiles();
      const activeName = client.getActiveProfileName();
      const lines = profiles.map(p => {
        const t      = p.token;
        const masked = t.length <= 3 ? "*".repeat(t.length) : t.slice(0, 2) + "*".repeat(t.length - 2);
        const active = p.name === activeName ? " ◀ active" : "";
        return `  ${p.name === activeName ? "▶" : " "} ${p.name.padEnd(16)}  Token: ${masked.padEnd(12)}  Database: ${p.database}  Region: ${p.region}${active}`;
      });
      return {
        content: [{ type: "text", text: ["**Available profiles**\n", ...lines].join("\n") }],
      };
    }
  );

  // ── Switch to a named profile ──────────────────────────────────────────────

  server.tool(
    "tmo_switch_profile",
    "Switch the active TMO credentials to a named profile. "
    + "ALWAYS call this before any data tool (loans, lenders, payments, etc.) "
    + "when the user mentions a specific database or environment (e.g. 'QA', 'prod', 'sandbox'). "
    + "Profile names come from TMO_PROFILES env var — use tmo_list_profiles to see them. "
    + "The switch is instant; no restart needed.",
    {
      profile: z.string().describe("Profile name to activate (case-insensitive, e.g. 'qa', 'prod')"),
    },
    async ({ profile }) => {
      const profiles = getProfiles();
      const match    = profiles.find(p => p.name === profile.trim().toLowerCase());
      if (!match) {
        const names = profiles.map(p => `'${p.name}'`).join(", ");
        return {
          content: [{ type: "text", text: `❌ Profile '${profile}' not found.\nAvailable: ${names}` }],
        };
      }

      client.updateConfig({ token: match.token, database: match.database, region: match.region });
      client.setActiveProfileName(match.name);
      const cfg = client.getPublicConfig();

      return {
        content: [{
          type: "text",
          text: [
            `✅ Switched to profile '${match.name}'.`,
            `  Token:    ${cfg.token}`,
            `  Database: ${cfg.database}`,
            `  Region:   ${cfg.region}`,
          ].join("\n"),
        }],
      };
    }
  );

  // ── Get current credentials ────────────────────────────────────────────────

  server.tool(
    "tmo_get_credentials",
    "Show the currently active TMO API credentials (token is masked for security).",
    {},
    async () => {
      const cfg   = client.getPublicConfig();
      const lines = [
        "**Active TMO credentials**",
        ...(cfg.profile ? [`  Profile:  ${cfg.profile}`] : ["  Profile:  (manually set)"]),
        `  Token:    ${cfg.token}`,
        `  Database: ${cfg.database}`,
        `  Region:   ${cfg.region}`,
      ];
      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
  );

  // ── Manual one-off override ────────────────────────────────────────────────

  server.tool(
    "tmo_set_credentials",
    "Manually override the active TMO token, database, and/or region. "
    + "Prefer tmo_switch_profile for named environments. "
    + "Only supply the fields you want to change.",
    {
      token:    z.string().optional().describe("API token"),
      database: z.string().optional().describe("Database name"),
      region:   z.enum(["us", "ca", "aus"]).optional().describe("Region (default: us)"),
    },
    async ({ token, database, region }) => {
      if (!token && !database && !region) {
        return { content: [{ type: "text", text: "⚠️  No fields provided — nothing changed." }] };
      }
      client.updateConfig({ token, database, region });
      client.setActiveProfileName(undefined);
      const cfg = client.getPublicConfig();
      return {
        content: [{
          type: "text",
          text: [
            "✅ Credentials updated.",
            `  Token:    ${cfg.token}`,
            `  Database: ${cfg.database}`,
            `  Region:   ${cfg.region}`,
          ].join("\n"),
        }],
      };
    }
  );
}
