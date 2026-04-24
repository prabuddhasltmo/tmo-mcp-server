import { z } from "zod";
import type { TmoClient } from "../client.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const auditParams = {
  createdAfter: z.string().optional(),
  createdBefore: z.string().optional(),
  sysTimeStampAfter: z.string().optional(),
  sysTimeStampBefore: z.string().optional(),
};

export function registerLssAttachmentTools(server: McpServer, client: TmoClient) {
  // ── Loan Attachments ──────────────────────────────────────────────────────

  server.tool(
    "lss_get_loan_attachments",
    "List attachments for an LSS loan with optional audit date filters",
    {
      account: z.string().describe("Loan account number"),
      ...auditParams,
    },
    async ({ account, createdAfter, createdBefore, sysTimeStampAfter, sysTimeStampBefore }) => {
      const data = await client.get(`/LSS.svc/GetLoanAttachments/${account}`, {
        createdAfter,
        createdBefore,
        sysTimeStampAfter,
        sysTimeStampBefore,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_get_loan_attachment",
    "Get a specific LSS loan attachment by RecID",
    { recId: z.string().describe("Attachment record ID") },
    async ({ recId }) => {
      const data = await client.get(`/LSS.svc/GetLoanAttachment/${recId}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_add_loan_attachment",
    "Upload an attachment to an LSS loan",
    {
      loanNumber: z.string().describe("Loan number"),
      attachment: z.record(z.unknown()).describe("Attachment object with base64 content"),
    },
    async ({ loanNumber, attachment }) => {
      const data = await client.post(`/LSS.svc/AddLSAttachment/${loanNumber}`, attachment);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // ── Lender Attachments ────────────────────────────────────────────────────

  server.tool(
    "lss_get_lender_attachments",
    "List attachments for a lender",
    { lenderId: z.string().describe("Lender account number or ID") },
    async ({ lenderId }) => {
      const data = await client.get(`/LSS.svc/GetLenderAttachments/${lenderId}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_get_lender_attachment",
    "Get a specific lender attachment by RecID",
    { recId: z.string().describe("Attachment record ID") },
    async ({ recId }) => {
      const data = await client.get(`/LSS.svc/GetLenderAttachment/${recId}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_add_lender_attachment",
    "Upload an attachment to a lender record",
    {
      lenderAccount: z.string().describe("Lender account number"),
      attachment: z.record(z.unknown()).describe("Attachment object with base64 content"),
    },
    async ({ lenderAccount, attachment }) => {
      const data = await client.post(`/LSS.svc/AddLSAttachment/Lender/${lenderAccount}`, attachment);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
