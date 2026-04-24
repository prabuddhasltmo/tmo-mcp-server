import { z } from "zod";
import type { TmoClient } from "../client.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerCapitalTools(server: McpServer, client: TmoClient) {
  // ── Pools ─────────────────────────────────────────────────────────────────

  server.tool(
    "capital_get_pools",
    "List all capital (mortgage pool) pools",
    {},
    async () => {
      const data = await client.get("/LSS.svc/Capital/Pools");
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "capital_get_pool",
    "Get details for a specific capital pool",
    { account: z.string().describe("Capital pool account number") },
    async ({ account }) => {
      const data = await client.get(`/LSS.svc/Capital/Pools/${account}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "capital_get_pool_partners",
    "Get partners for a specific capital pool",
    { account: z.string().describe("Capital pool account number") },
    async ({ account }) => {
      const data = await client.get(`/LSS.svc/Capital/Pools/${account}/Partners`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "capital_get_pool_bank_accounts",
    "Get bank accounts for a capital pool",
    {
      poolAccount: z.string().describe("Pool account number"),
      accountNumber: z.string().optional().describe("Filter by bank account number"),
      accountName: z.string().optional().describe("Filter by bank account name"),
    },
    async ({ poolAccount, accountNumber, accountName }) => {
      const data = await client.get(`/LSS.svc/Capital/Pools/${poolAccount}/BankAccounts`, {
        "account-number": accountNumber,
        "account-name": accountName,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "capital_get_pool_attachments",
    "Get attachments for a capital pool",
    { poolAccount: z.string().describe("Pool account number") },
    async ({ poolAccount }) => {
      const data = await client.get(`/LSS.svc/Capital/Pools/${poolAccount}/Attachments`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "capital_get_pool_loans",
    "Get loans in a capital pool",
    { poolId: z.string().describe("Capital pool account/ID") },
    async ({ poolId }) => {
      const data = await client.get(`/LSS.svc/Capital/Pools/${poolId}/Loans`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // ── Partners ──────────────────────────────────────────────────────────────

  server.tool(
    "capital_get_partners",
    "Get capital partners with optional date range",
    {
      fromDate: z.string().optional().describe("Start date (YYYY-MM-DD)"),
      toDate: z.string().optional().describe("End date (YYYY-MM-DD)"),
    },
    async ({ fromDate, toDate }) => {
      const data = await client.get("/LSS.svc/Capital/Partners", {
        "from-date": fromDate,
        "to-date": toDate,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "capital_get_partner",
    "Get a specific capital partner by account number",
    { partnerAccount: z.string().describe("Partner account number") },
    async ({ partnerAccount }) => {
      const data = await client.get(`/LSS.svc/Capital/Partners/${partnerAccount}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "capital_get_partner_attachments",
    "Get attachments for a capital partner",
    { partnerAccount: z.string().describe("Partner account number") },
    async ({ partnerAccount }) => {
      const data = await client.get(`/LSS.svc/Capital/Partners/${partnerAccount}/Attachments`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "capital_create_partner",
    "Create a new capital partner",
    { partner: z.record(z.unknown()).describe("Partner object (MBS.CPartner)") },
    async ({ partner }) => {
      const data = await client.post("/LSS.svc/Capital/Partners", partner);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "capital_update_partner",
    "Update an existing capital partner",
    {
      partnerAccount: z.string().describe("Partner account number"),
      fields: z.record(z.unknown()).describe("Fields to update"),
    },
    async ({ partnerAccount, fields }) => {
      const data = await client.patch(`/LSS.svc/Capital/Partners/${partnerAccount}`, fields);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // ── Distributions & History ───────────────────────────────────────────────

  server.tool(
    "capital_get_distributions",
    "Get capital distributions for a pool and date range",
    {
      poolAccount: z.string().optional().describe("Pool account number"),
      fromDate: z.string().optional(),
      toDate: z.string().optional(),
    },
    async ({ poolAccount, fromDate, toDate }) => {
      const data = await client.get("/LSS.svc/Capital/Distributions", {
        "pool-account": poolAccount,
        "from-date": fromDate,
        "to-date": toDate,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "capital_get_history",
    "Get capital history with optional filters",
    {
      partnerAccount: z.string().optional(),
      poolAccount: z.string().optional(),
      fromDate: z.string().optional(),
      toDate: z.string().optional(),
    },
    async ({ partnerAccount, poolAccount, fromDate, toDate }) => {
      const data = await client.get("/LSS.svc/Capital/History", {
        "partner-account": partnerAccount,
        "pool-account": poolAccount,
        "from-date": fromDate,
        "to-date": toDate,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
