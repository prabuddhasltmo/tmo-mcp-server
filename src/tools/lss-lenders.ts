import { z } from "zod";
import type { TmoClient } from "../client.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerLssLenderTools(server: McpServer, client: TmoClient) {
  // ── Lenders ───────────────────────────────────────────────────────────────

  server.tool(
    "lss_get_lenders",
    "List all LSS lenders",
    {
      pageSize: z.number().optional(),
      offset: z.number().optional(),
    },
    async ({ pageSize, offset }) => {
      const data = await client.get("/LSS.svc/GetLenders", undefined, { pageSize, offset });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_get_lender",
    "Get a single lender by account number",
    { account: z.string().describe("Lender account number") },
    async ({ account }) => {
      const data = await client.get(`/LSS.svc/GetLender/${account}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_get_lenders_by_timestamp",
    "Get lenders modified within a date range",
    {
      from: z.string().describe("Start datetime (YYYY-MM-DDTHH:MM:SS)"),
      to: z.string().describe("End datetime (YYYY-MM-DDTHH:MM:SS)"),
    },
    async ({ from, to }) => {
      const data = await client.get(`/LSS.svc/GetLendersByTimestamp/${from}/${to}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_get_lender_history",
    "Get history for a specific lender within a date range",
    {
      account: z.string().describe("Lender account number"),
      from: z.string().describe("Start date (YYYY-MM-DD)"),
      to: z.string().describe("End date (YYYY-MM-DD)"),
    },
    async ({ account, from, to }) => {
      const data = await client.get(`/LSS.svc/GetLenderHistory/${account}/${from}/${to}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_get_all_lender_history",
    "Get history for all lenders within a date range",
    {
      from: z.string().describe("Start date (YYYY-MM-DD)"),
      to: z.string().describe("End date (YYYY-MM-DD)"),
    },
    async ({ from, to }) => {
      const data = await client.get(`/LSS.svc/GetAllLenderHistory/${from}/${to}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_search_lender_history",
    "Search lender history by lender accounts and date range",
    {
      lenderAccounts: z.string().optional().describe("Comma-separated lender account record IDs"),
      from: z.string().optional().describe("Start date (YYYY-MM-DD)"),
      to: z.string().optional().describe("End date (YYYY-MM-DD)"),
    },
    async ({ lenderAccounts, from, to }) => {
      const data = await client.get("/LSS.svc/search-lender-history", {
        lenderAccounts,
        from,
        to,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_get_lender_portfolio",
    "Get the loan portfolio for a lender",
    { lenderAccount: z.string().describe("Lender account number") },
    async ({ lenderAccount }) => {
      const data = await client.get(`/LSS.svc/GetLenderPortfolio/${lenderAccount}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_new_lender",
    "Create a new lender",
    { lender: z.record(z.unknown()).describe("Lender object (CLender)") },
    async ({ lender }) => {
      const data = await client.post("/LSS.svc/NewLender", lender);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_update_lender",
    "Update an existing lender",
    { lender: z.record(z.unknown()).describe("Lender object with account number") },
    async ({ lender }) => {
      const data = await client.post("/LSS.svc/UpdateLender", lender);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_delete_lender",
    "Delete a lender by account number",
    { account: z.string().describe("Lender account number") },
    async ({ account }) => {
      const data = await client.delete(`/LSS.svc/DeleteLender/${account}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // ── Vendors ───────────────────────────────────────────────────────────────

  server.tool(
    "lss_get_vendors",
    "List all LSS vendors",
    {
      pageSize: z.number().optional(),
      offset: z.number().optional(),
    },
    async ({ pageSize, offset }) => {
      const data = await client.get("/LSS.svc/GetVendors", undefined, { pageSize, offset });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_get_vendor",
    "Get a single vendor by account number",
    { account: z.string().describe("Vendor account number") },
    async ({ account }) => {
      const data = await client.get(`/LSS.svc/GetVendor/${account}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_get_vendors_by_timestamp",
    "Get vendors modified within a date range",
    {
      from: z.string().describe("Start datetime"),
      to: z.string().describe("End datetime"),
    },
    async ({ from, to }) => {
      const data = await client.get(`/LSS.svc/GetVendorsByTimestamp/${from}/${to}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_delete_vendor",
    "Delete a vendor by account number",
    { account: z.string().describe("Vendor account number") },
    async ({ account }) => {
      const data = await client.delete(`/LSS.svc/DeleteVendor/${account}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
