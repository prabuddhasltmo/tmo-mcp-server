import { z } from "zod";
import type { TmoClient } from "../client.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerLssPaymentTools(server: McpServer, client: TmoClient) {
  server.tool(
    "lss_create_payment",
    "Post a payment to an LSS loan",
    {
      loanAccount: z.string().describe("Loan account number"),
      payment: z.record(z.unknown()).describe("Payment object (CPayment)"),
    },
    async ({ loanAccount, payment }) => {
      const data = await client.post(`/LSS.svc/loans/${loanAccount}/payment`, payment);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_create_payoff_payment",
    "Post a payoff payment to an LSS loan",
    {
      loanAccount: z.string().describe("Loan account number"),
      payment: z.record(z.unknown()).describe("Payoff payment object (CLoanPayoffPayment)"),
    },
    async ({ loanAccount, payment }) => {
      const data = await client.post(`/LSS.svc/loans/${loanAccount}/payoff`, payment);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_get_payoff_quote",
    "Get a payoff quote for an LSS loan",
    {
      loanAccount: z.string().describe("Loan account number"),
      filters: z.record(z.unknown()).describe("Payoff quote filters (CLoanPayoffFilters)"),
    },
    async ({ loanAccount, filters }) => {
      const data = await client.post(`/LSS.svc/loans/${loanAccount}/payoff-quote`, filters);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_loan_adjustment",
    "Post a general adjustment to an LSS loan",
    { adjustment: z.record(z.unknown()).describe("Loan adjustment object (CLoanAdjustmentPayment)") },
    async ({ adjustment }) => {
      const data = await client.post("/LSS.svc/LoanAdjustment", adjustment);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
