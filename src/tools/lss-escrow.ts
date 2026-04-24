import { z } from "zod";
import type { TmoClient } from "../client.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerLssEscrowTools(server: McpServer, client: TmoClient) {
  server.tool(
    "lss_get_escrow_vouchers",
    "List escrow/impound vouchers for an LSS loan",
    { account: z.string().describe("Loan account number") },
    async ({ account }) => {
      const data = await client.get(`/LSS.svc/GetEscrowVouchers/${account}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_find_escrow_vouchers",
    "Search escrow vouchers with filter criteria",
    { filter: z.record(z.unknown()).describe("Voucher filter object (CEscrowVoucherFilter)") },
    async ({ filter }) => {
      const data = await client.post("/LSS.svc/FindEscrowVouchers", filter);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_new_escrow_voucher",
    "Create a single escrow voucher",
    { voucher: z.record(z.unknown()).describe("Voucher object (CEscrowVoucher)") },
    async ({ voucher }) => {
      const data = await client.post("/LSS.svc/NewEscrowVoucher", voucher);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_new_escrow_vouchers",
    "Create multiple escrow vouchers in one request",
    { vouchers: z.array(z.record(z.unknown())).describe("Array of voucher objects") },
    async ({ vouchers }) => {
      const data = await client.post("/LSS.svc/NewEscrowVouchers", vouchers);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_update_escrow_voucher",
    "Update a single escrow voucher",
    { voucher: z.record(z.unknown()).describe("Voucher object with RecID") },
    async ({ voucher }) => {
      const data = await client.post("/LSS.svc/UpdateEscrowVoucher", voucher);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_update_escrow_vouchers",
    "Update multiple escrow vouchers in one request",
    { vouchers: z.array(z.record(z.unknown())).describe("Array of voucher objects with RecIDs") },
    async ({ vouchers }) => {
      const data = await client.post("/LSS.svc/UpdateEscrowVouchers", vouchers);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_delete_escrow_voucher",
    "Delete an escrow voucher by RecID",
    { recId: z.string().describe("Voucher record ID") },
    async ({ recId }) => {
      const data = await client.delete(`/LSS.svc/DeleteEscrowVoucher/${recId}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_get_loan_impound_balance",
    "Get the impound balance for an LSS loan as of a date",
    {
      account: z.string().describe("Loan account number"),
      asOf: z.string().optional().describe("As-of date (YYYY-MM-DD), defaults to today"),
    },
    async ({ account, asOf }) => {
      const data = await client.get(`/LSS.svc/GetLoanImpoundBalance/${account}`, { asof: asOf });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_get_loan_reserve_balance",
    "Get the reserve balance for an LSS loan as of a date",
    {
      account: z.string().describe("Loan account number"),
      asOf: z.string().optional().describe("As-of date (YYYY-MM-DD), defaults to today"),
    },
    async ({ account, asOf }) => {
      const data = await client.get(`/LSS.svc/GetLoanReserveBalance/${account}`, { asof: asOf });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
