import { z } from "zod";
import type { TmoClient } from "../client.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerLssFundingTools(server: McpServer, client: TmoClient) {
  server.tool(
    "lss_get_loan_funding",
    "Get funding records for an LSS loan",
    { account: z.string().describe("Loan account number") },
    async ({ account }) => {
      const data = await client.get(`/LSS.svc/GetLoanFunding/${account}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_get_loan_funding_history",
    "Get funding history for an LSS loan",
    { account: z.string().describe("Loan account number") },
    async ({ account }) => {
      const data = await client.get(`/LSS.svc/GetLoanFundingHistory/${account}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_get_funding_history",
    "Get detailed funding history for a loan",
    { loanNumber: z.string().describe("Loan number") },
    async ({ loanNumber }) => {
      const data = await client.get(`/LSS.svc/GetFundingHistory/${loanNumber}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_get_funding_status",
    "Get the status of an async funding operation",
    { id: z.string().describe("Funding operation ID") },
    async ({ id }) => {
      const data = await client.get(`/LSS.svc/GetFundingStatus/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_get_funding_disbursements",
    "Get funding disbursements with various filters",
    {
      recId: z.string().optional().describe("Disbursement record ID"),
      loanRecId: z.string().optional().describe("Loan record ID"),
      lenderRecId: z.string().optional().describe("Lender record ID"),
      active: z.boolean().optional().describe("Filter active disbursements"),
      createdAfter: z.string().optional(),
      createdBefore: z.string().optional(),
      modifiedAfter: z.string().optional(),
      modifiedBefore: z.string().optional(),
      sortOrder: z.string().optional().describe("Sort order (asc/desc)"),
    },
    async (params) => {
      const data = await client.get("/LSS.svc/get-funding-disbursements", params as Record<string, string | number | boolean | undefined>);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_add_funding",
    "Add a single funding to an LSS loan",
    { funding: z.record(z.unknown()).describe("Funding object (CFunding)") },
    async ({ funding }) => {
      const data = await client.post("/LSS.svc/AddFunding", funding);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_add_fundings",
    "Add multiple fundings to LSS loans",
    { fundings: z.array(z.record(z.unknown())).describe("Array of funding objects") },
    async ({ fundings }) => {
      const data = await client.post("/LSS.svc/AddFundings", fundings);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_add_fundings_async",
    "Add fundings asynchronously (returns operation ID)",
    { fundings: z.array(z.record(z.unknown())).describe("Array of funding objects") },
    async ({ fundings }) => {
      const data = await client.post("/LSS.svc/AddFundingsAsync", fundings);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_add_multiple_fundings",
    "Add multiple fundings (alternative batch endpoint)",
    { fundings: z.array(z.record(z.unknown())).describe("Array of funding objects") },
    async ({ fundings }) => {
      const data = await client.post("/LSS.svc/AddMultipleFundings", fundings);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_get_commitments",
    "Get loan commitments with optional filters",
    {
      loanRecId: z.string().optional().describe("Loan record ID"),
      lenderRecId: z.string().optional().describe("Lender record ID"),
      dateExpectedFrom: z.string().optional(),
      dateExpectedTo: z.string().optional(),
      dateReceivedFrom: z.string().optional(),
      dateReceivedTo: z.string().optional(),
    },
    async (params) => {
      const data = await client.get("/LSS.svc/commitments", params as Record<string, string | undefined>);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
