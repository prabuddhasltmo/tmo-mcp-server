import { z } from "zod";
import type { TmoClient } from "../client.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerLssChargeTools(server: McpServer, client: TmoClient) {
  server.tool(
    "lss_get_loan_charges",
    "Get charges for an LSS loan with optional date filters",
    {
      account: z.string().describe("Loan account number"),
      createdAfter: z.string().optional(),
      createdBefore: z.string().optional(),
      sysTimeStampAfter: z.string().optional(),
      sysTimeStampBefore: z.string().optional(),
    },
    async ({ account, createdAfter, createdBefore, sysTimeStampAfter, sysTimeStampBefore }) => {
      const data = await client.get(`/LSS.svc/GetLoanCharges/${account}`, {
        createdAfter,
        createdBefore,
        sysTimeStampAfter,
        sysTimeStampBefore,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_new_loan_charge",
    "Create a new charge on an LSS loan",
    { charge: z.record(z.unknown()).describe("Charge object (CCharge)") },
    async ({ charge }) => {
      const data = await client.post("/LSS.svc/NewLoanCharge", charge);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_update_loan_charge",
    "Update an existing charge on an LSS loan",
    { charge: z.record(z.unknown()).describe("Charge object with RecID") },
    async ({ charge }) => {
      const data = await client.post("/LSS.svc/UpdateLoanCharge", charge);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
