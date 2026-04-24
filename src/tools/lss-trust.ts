import { z } from "zod";
import type { TmoClient } from "../client.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerLssTrustTools(server: McpServer, client: TmoClient) {
  server.tool(
    "lss_get_loan_trust_ledger",
    "Get trust ledger transactions for an LSS loan",
    { account: z.string().describe("Loan account number") },
    async ({ account }) => {
      const data = await client.get(`/LSS.svc/GetLoanTrustLedger/${account}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_get_trust_ledger_by_pool",
    "Get trust ledger entries filtered by pool/bank account",
    {
      account: z.string().describe("Loan account number"),
      fromDate: z.string().optional().describe("Start date (YYYY-MM-DD)"),
      toDate: z.string().optional().describe("End date (YYYY-MM-DD)"),
      bankAccountName: z.string().optional().describe("Bank account name to filter by"),
    },
    async ({ account, fromDate, toDate, bankAccountName }) => {
      const data = await client.get(`/LSS.svc/servicing/trust-ledger/${account}`, {
        fromDate,
        toDate,
        "bank-account-name": bankAccountName,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_get_trust_account_activities",
    "Get trust account activities for a trust account",
    {
      accountRecId: z.string().describe("Trust account record ID"),
      fromDate: z.string().optional().describe("Start date (YYYY-MM-DD)"),
      toDate: z.string().optional().describe("End date (YYYY-MM-DD)"),
      payAccount: z.string().optional().describe("Pay account filter"),
    },
    async ({ accountRecId, fromDate, toDate, payAccount }) => {
      const data = await client.get(`/LSS.svc/TrustAccounts/${accountRecId}`, {
        fromdate: fromDate,
        todate: toDate,
        payaccount: payAccount,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_new_trust_ledger_adjustment",
    "Create a trust ledger adjustment for an LSS loan",
    { adjustment: z.record(z.unknown()).describe("Trust ledger adjustment object") },
    async ({ adjustment }) => {
      const data = await client.post("/LSS.svc/NewLoanTrustLedgerAdjustment", adjustment);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_new_trust_ledger_deposit",
    "Create a trust ledger deposit for an LSS loan",
    { deposit: z.record(z.unknown()).describe("Trust ledger deposit object") },
    async ({ deposit }) => {
      const data = await client.post("/LSS.svc/NewLoanTrustLedgerDeposit", deposit);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_new_trust_ledger_check",
    "Create a trust ledger check for an LSS loan",
    { check: z.record(z.unknown()).describe("Trust ledger check object (CEscrowCheck)") },
    async ({ check }) => {
      const data = await client.post("/LSS.svc/NewLoanTrustLedgerCheck", check);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_update_loan_trust_balance",
    "Update the trust balance for an LSS loan",
    { balance: z.record(z.unknown()).describe("Trust balance update object") },
    async ({ balance }) => {
      const data = await client.post("/LSS.svc/UpdateLoanTrustBalance", balance);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
