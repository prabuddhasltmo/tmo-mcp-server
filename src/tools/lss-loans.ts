import { z } from "zod";
import type { TmoClient } from "../client.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerLssLoanTools(server: McpServer, client: TmoClient) {
  server.tool(
    "lss_get_loans",
    "List all LSS (servicing) loans",
    {
      pageSize: z.number().optional(),
      offset: z.number().optional(),
    },
    async ({ pageSize, offset }) => {
      const data = await client.get("/LSS.svc/GetLoans", undefined, { pageSize, offset });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_get_loans2",
    "List all LSS loans (alternative endpoint with extended fields)",
    {
      pageSize: z.number().optional(),
      offset: z.number().optional(),
    },
    async ({ pageSize, offset }) => {
      const data = await client.get("/LSS.svc/GetLoans2", undefined, { pageSize, offset });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_get_loan",
    "Get a single LSS loan by account number",
    { account: z.string().describe("Loan account number") },
    async ({ account }) => {
      const data = await client.get(`/LSS.svc/GetLoan/${account}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_get_loan2",
    "Get a single LSS loan (alternative endpoint) by account number",
    { account: z.string().describe("Loan account number") },
    async ({ account }) => {
      const data = await client.get(`/LSS.svc/GetLoan2/${account}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_get_loans_by_timestamp",
    "Get LSS loans modified within a date range",
    {
      from: z.string().describe("Start datetime (YYYY-MM-DDTHH:MM:SS)"),
      to: z.string().describe("End datetime (YYYY-MM-DDTHH:MM:SS)"),
    },
    async ({ from, to }) => {
      const data = await client.get(`/LSS.svc/GetLoansByTimestamp/${from}/${to}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_new_loan",
    "Create a new LSS loan",
    { loan: z.record(z.unknown()).describe("Loan object (CLoan)") },
    async ({ loan }) => {
      const data = await client.post("/LSS.svc/NewLoan", loan);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_update_loan",
    "Update an existing LSS loan",
    { loan: z.record(z.unknown()).describe("Loan object with account number") },
    async ({ loan }) => {
      const data = await client.post("/LSS.svc/UpdateLoan", loan);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_patch_loan",
    "Partially update an LSS loan",
    {
      account: z.string().describe("Loan account number"),
      fields: z.record(z.unknown()).describe("Fields to update"),
    },
    async ({ account, fields }) => {
      const data = await client.patch(`/LSS.svc/Loans/${account}`, fields);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_delete_loan",
    "Delete an LSS loan",
    { account: z.string().describe("Loan account number") },
    async ({ account }) => {
      const data = await client.delete(`/LSS.svc/DeleteLoan/${account}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_get_loan_payment_schedule",
    "Get the payment schedule for an LSS loan",
    { account: z.string().describe("Loan account number") },
    async ({ account }) => {
      const data = await client.get(`/LSS.svc/GetLoanPaymentSchedule/${account}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_get_loan_and_lender_payment_schedule",
    "Get combined loan and lender payment schedule",
    { account: z.string().describe("Loan account number") },
    async ({ account }) => {
      const data = await client.get(`/LSS.svc/GetLoanAndLenderPaymentSchedule/${account}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_apply_pending_modifications",
    "Apply pending loan modifications for an LSS loan",
    { account: z.string().describe("Loan account number") },
    async ({ account }) => {
      const data = await client.get(`/LSS.svc/ApplyPendingModifications/${account}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_get_accrued_interest",
    "Get accrued interest for an LSS loan as of a date",
    {
      account: z.string().describe("Loan account number"),
      endDate: z.string().describe("End date (YYYY-MM-DD)"),
    },
    async ({ account, endDate }) => {
      const data = await client.get(`/LSS.svc/GetAccruedInterest/${account}/${endDate}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_get_loan_calculate_details",
    "Calculate loan details for an LSS loan as of a date",
    {
      account: z.string().describe("Loan account number"),
      endDate: z.string().describe("End date (YYYY-MM-DD)"),
    },
    async ({ account, endDate }) => {
      const data = await client.get(`/LSS.svc/GetLoanCalculateDetails/${account}/${endDate}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_get_loan_billing_history",
    "Get billing history for an LSS loan",
    { account: z.string().describe("Loan account number") },
    async ({ account }) => {
      const data = await client.get(`/LSS.svc/GetLoanBillingHistory/${account}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_get_loan_liens",
    "Get liens for an LSS loan",
    { account: z.string().describe("Loan account number") },
    async ({ account }) => {
      const data = await client.get(`/LSS.svc/GetLoanLiens/${account}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_nsf_charge",
    "Apply an NSF (non-sufficient funds) charge to a loan",
    {
      recId: z.string().describe("Payment record ID"),
      nsfDate: z.string().describe("NSF date (YYYY-MM-DD)"),
      nsfCharge: z.number().describe("NSF charge amount"),
    },
    async ({ recId, nsfDate, nsfCharge }) => {
      const data = await client.get(`/LSS.svc/NSF/${recId}/${nsfDate}/${nsfCharge}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_grid_view",
    "Get grid view data for a named view",
    { view: z.string().describe("Grid view name") },
    async ({ view }) => {
      const data = await client.get(`/LSS.svc/GridView/${view}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_get_check_register",
    "Get the check register for a date range",
    {
      from: z.string().describe("Start date (YYYY-MM-DD)"),
      to: z.string().describe("End date (YYYY-MM-DD)"),
    },
    async ({ from, to }) => {
      const data = await client.get(`/LSS.svc/GetCheckRegister/${from}/${to}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_get_borrower_payment_register",
    "Get the borrower payment register for a date range",
    {
      from: z.string().describe("Start date (YYYY-MM-DD)"),
      to: z.string().describe("End date (YYYY-MM-DD)"),
    },
    async ({ from, to }) => {
      const data = await client.get(`/LSS.svc/GetBorrowerPaymentRegister/${from}/${to}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_borrower_payment_lockbox",
    "Post a borrower lockbox payment",
    { payment: z.record(z.unknown()).describe("CBorrowerPaymentLockBox object") },
    async ({ payment }) => {
      const data = await client.post("/LSS.svc/BorrowerPaymentLockBox", payment);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_get_loan_custom_field_value",
    "Get a custom field value for an LSS loan",
    {
      account: z.string().describe("Loan account number"),
      name: z.string().describe("Custom field name"),
    },
    async ({ account, name }) => {
      const data = await client.get(`/LSS.svc/GetLoanCustomFieldValue/${account}/${name}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_new_custom_field",
    "Create a new custom field definition",
    { customField: z.record(z.unknown()).describe("Custom field definition object") },
    async ({ customField }) => {
      const data = await client.post("/LSS.svc/NewCustomField", customField);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_delete_custom_field",
    "Delete a custom field definition by RecID",
    { recId: z.string().describe("Custom field record ID") },
    async ({ recId }) => {
      const data = await client.delete(`/LSS.svc/DeleteCustomField/${recId}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_update_loan_custom_fields",
    "Update custom fields on an LSS loan",
    {
      account: z.string().describe("Loan account number"),
      fields: z.record(z.unknown()).describe("Custom field values"),
    },
    async ({ account, fields }) => {
      const data = await client.patch(`/LSS.svc/UpdateLoanCustomFields/${account}`, fields);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_update_property_custom_fields",
    "Update custom fields on a property record",
    {
      propertyRecId: z.string().describe("Property record ID"),
      fields: z.record(z.unknown()).describe("Custom field values"),
    },
    async ({ propertyRecId, fields }) => {
      const data = await client.patch(`/LSS.svc/UpdatePropertyCustomFields/${propertyRecId}`, fields);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
