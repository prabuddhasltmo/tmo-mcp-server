import { z } from "zod";
import type { TmoClient } from "../client.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerLssHistoryTools(server: McpServer, client: TmoClient) {
  server.tool(
    "lss_get_loan_history",
    "Get transaction history for an LSS loan",
    { account: z.string().describe("Loan account number") },
    async ({ account }) => {
      const data = await client.get(`/LSS.svc/GetLoanHistory/${account}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_get_all_loan_history",
    "Get history across all loans filtered by date range and type",
    {
      from: z.string().describe("Start date (YYYY-MM-DD)"),
      to: z.string().describe("End date (YYYY-MM-DD)"),
      type: z.string().describe("History type code (e.g. P for payments, A for adjustments)"),
    },
    async ({ from, to, type }) => {
      const data = await client.get(`/LSS.svc/GetAllLoanHistory/${from}/${to}/${type}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_get_all_loan_history_by_created_date",
    "Get history across all loans by creation date range",
    {
      from: z.string().describe("Start date (YYYY-MM-DD)"),
      to: z.string().describe("End date (YYYY-MM-DD)"),
    },
    async ({ from, to }) => {
      const data = await client.get(`/LSS.svc/GetAllLoanHistoryByCreatedDate/${from}/${to}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_add_loan_history",
    "Create a loan history entry",
    { history: z.record(z.unknown()).describe("Loan history object (CLoanTran)") },
    async ({ history }) => {
      const data = await client.post("/LSS.svc/AddLoanHistory", history);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
