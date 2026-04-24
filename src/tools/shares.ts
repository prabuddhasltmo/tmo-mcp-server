import { z } from "zod";
import type { TmoClient } from "../client.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerSharesTools(server: McpServer, client: TmoClient) {
  // ── Pools ─────────────────────────────────────────────────────────────────

  server.tool(
    "shares_get_pools",
    "List all mortgage share pools",
    {},
    async () => {
      const data = await client.get("/LSS.svc/Shares/Pools");
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "shares_get_pool",
    "Get details for a specific share pool",
    { account: z.string().describe("Pool account number") },
    async ({ account }) => {
      const data = await client.get(`/LSS.svc/Shares/Pools/${account}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "shares_get_pool_partners",
    "Get partners for a specific share pool",
    { account: z.string().describe("Pool account number") },
    async ({ account }) => {
      const data = await client.get(`/LSS.svc/Shares/Pools/${account}/Partners`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "shares_get_pool_bank_accounts",
    "Get bank accounts for a share pool",
    {
      poolAccount: z.string().describe("Pool account number"),
      accountNumber: z.string().optional().describe("Filter by bank account number"),
      accountName: z.string().optional().describe("Filter by bank account name"),
    },
    async ({ poolAccount, accountNumber, accountName }) => {
      const data = await client.get(`/LSS.svc/Shares/Pools/${poolAccount}/BankAccounts`, {
        "account-number": accountNumber,
        "account-name": accountName,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "shares_get_pool_attachments",
    "Get attachments for a share pool",
    { poolAccount: z.string().describe("Pool account number") },
    async ({ poolAccount }) => {
      const data = await client.get(`/LSS.svc/Shares/Pools/${poolAccount}/Attachments`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "shares_get_pool_loans",
    "Get loans in a share pool",
    { poolId: z.string().describe("Pool account/ID") },
    async ({ poolId }) => {
      const data = await client.get(`/LSS.svc/Shares/Pools/${poolId}/Loans`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // ── Partners ──────────────────────────────────────────────────────────────

  server.tool(
    "shares_get_partners",
    "Get share partners with optional date range",
    {
      fromDate: z.string().optional().describe("Start date (YYYY-MM-DD)"),
      toDate: z.string().optional().describe("End date (YYYY-MM-DD)"),
    },
    async ({ fromDate, toDate }) => {
      const data = await client.get("/LSS.svc/Shares/Partners", {
        "from-date": fromDate,
        "to-date": toDate,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "shares_get_partner",
    "Get a specific share partner by account number",
    { partnerAccount: z.string().describe("Partner account number") },
    async ({ partnerAccount }) => {
      const data = await client.get(`/LSS.svc/Shares/Partners/${partnerAccount}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "shares_get_partner_attachments",
    "Get attachments for a share partner",
    { partnerAccount: z.string().describe("Partner account number") },
    async ({ partnerAccount }) => {
      const data = await client.get(`/LSS.svc/Shares/Partners/${partnerAccount}/Attachments`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "shares_create_partner",
    "Create a new share partner",
    { partner: z.record(z.unknown()).describe("Partner object (CPartner)") },
    async ({ partner }) => {
      const data = await client.post("/LSS.svc/Shares/Partners", partner);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "shares_update_partner",
    "Update an existing share partner",
    {
      partnerAccount: z.string().describe("Partner account number"),
      fields: z.record(z.unknown()).describe("Fields to update"),
    },
    async ({ partnerAccount, fields }) => {
      const data = await client.patch(`/LSS.svc/Shares/Partners/${partnerAccount}`, fields);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // ── Certificates & History ────────────────────────────────────────────────

  server.tool(
    "shares_get_certificates",
    "Get share certificates with optional filters",
    {
      partnerAccount: z.string().optional().describe("Partner account number"),
      poolAccount: z.string().optional().describe("Pool account number"),
      fromDate: z.string().optional(),
      toDate: z.string().optional(),
    },
    async ({ partnerAccount, poolAccount, fromDate, toDate }) => {
      const data = await client.get("/LSS.svc/Shares/Certificates", {
        "partner-account": partnerAccount,
        "pool-account": poolAccount,
        "from-date": fromDate,
        "to-date": toDate,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "shares_get_history",
    "Get share history with optional filters",
    {
      partnerAccount: z.string().optional(),
      poolAccount: z.string().optional(),
      fromDate: z.string().optional(),
      toDate: z.string().optional(),
    },
    async ({ partnerAccount, poolAccount, fromDate, toDate }) => {
      const data = await client.get("/LSS.svc/Shares/History", {
        "partner-account": partnerAccount,
        "pool-account": poolAccount,
        "from-date": fromDate,
        "to-date": toDate,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // ── Distributions ─────────────────────────────────────────────────────────

  server.tool(
    "shares_get_distributions",
    "Get share distributions for a pool and date range",
    {
      poolAccount: z.string().optional().describe("Pool account number"),
      fromDate: z.string().optional(),
      toDate: z.string().optional(),
    },
    async ({ poolAccount, fromDate, toDate }) => {
      const data = await client.get("/LSS.svc/Shares/Distributions", {
        "pool-account": poolAccount,
        "from-date": fromDate,
        "to-date": toDate,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "shares_get_distribution_audit",
    "Get the audit report for a specific share distribution",
    { distributionRecId: z.string().describe("Distribution record ID") },
    async ({ distributionRecId }) => {
      const data = await client.get(`/LSS.svc/Shares/Distributions/${distributionRecId}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "shares_preview_manual_distribution",
    "Preview a manual share distribution before creating it",
    { request: z.record(z.unknown()).describe("Manual distribution request (Pss.CManualDistributionRequest)") },
    async ({ request }) => {
      const data = await client.post("/LSS.svc/Shares/Distributions/manual/preview", request);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "shares_create_manual_distribution",
    "Create a manual share distribution",
    { request: z.record(z.unknown()).describe("Manual distribution request (Pss.CManualDistributionRequest)") },
    async ({ request }) => {
      const data = await client.post("/LSS.svc/Shares/Distributions/manual", request);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
