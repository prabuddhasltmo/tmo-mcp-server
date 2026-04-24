import { z } from "zod";
import type { TmoClient } from "../client.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerLosTools(server: McpServer, client: TmoClient) {
  // ── Loan Applications ────────────────────────────────────────────────────

  server.tool(
    "los_get_loan_application",
    "Retrieve a loan application by its application number",
    { loanApplicationNumber: z.string().describe("Loan application number") },
    async ({ loanApplicationNumber }) => {
      const data = await client.get(`/LOS.svc/GetLoanApplication/${loanApplicationNumber}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "los_new_loan_application",
    "Create a new loan application",
    { application: z.record(z.unknown()).describe("Loan application object (CLOSLoanApplication)") },
    async ({ application }) => {
      const data = await client.post("/LOS.svc/NewLoanApplication", application);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "los_update_loan_application",
    "Update an existing loan application",
    { application: z.record(z.unknown()).describe("Loan application object with RecID") },
    async ({ application }) => {
      const data = await client.post("/LOS.svc/UpdateLoanApplication", application);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // ── Loans ─────────────────────────────────────────────────────────────────

  server.tool(
    "los_get_loans",
    "List all LOS loans (supports pagination via pageSize/offset)",
    {
      pageSize: z.number().optional().describe("Number of records per page"),
      offset: z.number().optional().describe("Record offset for pagination"),
    },
    async ({ pageSize, offset }) => {
      const data = await client.get("/LOS.svc/GetLoans", undefined, { pageSize, offset });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "los_get_loan",
    "Get a single LOS loan by account number",
    { account: z.string().describe("Loan account number") },
    async ({ account }) => {
      const data = await client.get(`/LOS.svc/GetLoan/${account}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "los_get_loans_by_timestamp",
    "Get LOS loans modified within a date range",
    {
      from: z.string().describe("Start datetime (YYYY-MM-DDTHH:MM:SS)"),
      to: z.string().describe("End datetime (YYYY-MM-DDTHH:MM:SS)"),
    },
    async ({ from, to }) => {
      const data = await client.get(`/LOS.svc/GetLoansByTimestamp/${from}/${to}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "los_new_loan",
    "Create a new LOS loan",
    { loan: z.record(z.unknown()).describe("Loan object (CLOSLoan)") },
    async ({ loan }) => {
      const data = await client.post("/LOS.svc/NewLoan", loan);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "los_update_loan",
    "Update an existing LOS loan (full update)",
    { loan: z.record(z.unknown()).describe("Loan object with account number") },
    async ({ loan }) => {
      const data = await client.post("/LOS.svc/UpdateLoan", loan);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "los_patch_loan",
    "Partially update a LOS loan",
    {
      loanNumber: z.string().describe("Loan number"),
      fields: z.record(z.unknown()).describe("Fields to update"),
    },
    async ({ loanNumber, fields }) => {
      const data = await client.patch(`/LOS.svc/Loans/${loanNumber}`, fields);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "los_delete_loan",
    "Delete a LOS loan",
    { loanNumber: z.string().describe("Loan number to delete") },
    async ({ loanNumber }) => {
      const data = await client.delete(`/LOS.svc/DeleteLoan/${loanNumber}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // ── Collateral ────────────────────────────────────────────────────────────

  server.tool(
    "los_new_collateral",
    "Create a new collateral/property record on a LOS loan",
    { collateral: z.record(z.unknown()).describe("Collateral object (CLOSCollateral)") },
    async ({ collateral }) => {
      const data = await client.post("/LOS.svc/NewCollateral", collateral);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "los_update_collateral",
    "Update collateral/property on a LOS loan",
    { collateral: z.record(z.unknown()).describe("Collateral object with RecID") },
    async ({ collateral }) => {
      const data = await client.post("/LOS.svc/UpdateCollateral", collateral);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "los_delete_collateral",
    "Delete a collateral record by RecID",
    { recId: z.string().describe("Collateral record ID") },
    async ({ recId }) => {
      const data = await client.delete(`/LOS.svc/DeleteCollateral/${recId}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // ── Borrowers ─────────────────────────────────────────────────────────────

  server.tool(
    "los_new_borrower",
    "Create a new borrower on a LOS loan",
    { borrower: z.record(z.unknown()).describe("Borrower object (CLOSBorrower)") },
    async ({ borrower }) => {
      const data = await client.post("/LOS.svc/NewBorrower", borrower);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "los_update_borrower",
    "Update a borrower on a LOS loan",
    { borrower: z.record(z.unknown()).describe("Borrower object with RecID") },
    async ({ borrower }) => {
      const data = await client.post("/LOS.svc/UpdateBorrower", borrower);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "los_delete_borrower",
    "Delete a borrower record by RecID",
    { recId: z.string().describe("Borrower record ID") },
    async ({ recId }) => {
      const data = await client.delete(`/LOS.svc/DeleteBorrower/${recId}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // ── Loan Fundings ─────────────────────────────────────────────────────────

  server.tool(
    "los_get_loan_fundings",
    "Get fundings for a LOS loan",
    { account: z.string().describe("Loan account number") },
    async ({ account }) => {
      const data = await client.get(`/LOS.svc/GetLoanFundings/${account}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "los_add_loan_funding",
    "Add funding to a LOS loan (batch)",
    { funding: z.record(z.unknown()).describe("Funding object (CLOSFunding)") },
    async ({ funding }) => {
      const data = await client.post("/LOS.svc/AddLoanFunding", funding);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "los_update_loan_funding",
    "Update a loan funding record",
    { funding: z.record(z.unknown()).describe("Funding object with RecID") },
    async ({ funding }) => {
      const data = await client.post("/LOS.svc/UpdateLoanFunding", funding);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // ── Attachments ───────────────────────────────────────────────────────────

  server.tool(
    "los_get_loan_attachments",
    "List attachments for a LOS loan",
    { loanNumber: z.string().describe("Loan number") },
    async ({ loanNumber }) => {
      const data = await client.get(`/LOS.svc/GetLoanAttachments/${loanNumber}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "los_get_loan_attachment",
    "Get a specific LOS loan attachment by RecID",
    { recId: z.string().describe("Attachment record ID") },
    async ({ recId }) => {
      const data = await client.get(`/LOS.svc/GetLoanAttachment/${recId}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "los_add_attachment",
    "Upload an attachment to a LOS loan",
    {
      loanNumber: z.string().describe("Loan number"),
      attachment: z.record(z.unknown()).describe("Attachment object with base64 content"),
    },
    async ({ loanNumber, attachment }) => {
      const data = await client.post(`/LOS.svc/AddAttachment/${loanNumber}`, attachment);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // ── Reference Data ────────────────────────────────────────────────────────

  server.tool(
    "los_get_products",
    "Get available loan products",
    {},
    async () => {
      const data = await client.get("/LOS.svc/GetProducts");
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
