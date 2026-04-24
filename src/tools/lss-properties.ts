import { z } from "zod";
import type { TmoClient } from "../client.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerLssPropertyTools(server: McpServer, client: TmoClient) {
  server.tool(
    "lss_get_loan_properties",
    "Get properties/collateral for an LSS loan",
    { account: z.string().describe("Loan account number") },
    async ({ account }) => {
      const data = await client.get(`/LSS.svc/GetLoanProperties/${account}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_search_properties",
    "Search properties across loans (supports flood zone and account filters)",
    {
      accounts: z.string().optional().describe("Comma-separated loan accounts"),
      floodZone: z.boolean().optional().describe("Filter by flood zone flag"),
      propertyRecIds: z.string().optional().describe("Comma-separated property record IDs"),
    },
    async ({ accounts, floodZone, propertyRecIds }) => {
      const data = await client.get("/LSS.svc/GetSearchProperties", {
        accounts,
        floodZone,
        propertyRecIds,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_new_property",
    "Create a new property on an LSS loan",
    { property: z.record(z.unknown()).describe("Property object (CCollateral)") },
    async ({ property }) => {
      const data = await client.post("/LSS.svc/NewProperty", property);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_update_property",
    "Update a property on an LSS loan",
    { property: z.record(z.unknown()).describe("Property object with RecID") },
    async ({ property }) => {
      const data = await client.post("/LSS.svc/UpdateProperty", property);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_delete_property",
    "Delete a property record by RecID",
    { recId: z.string().describe("Property record ID") },
    async ({ recId }) => {
      const data = await client.delete(`/LSS.svc/DeleteProperty/${recId}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_get_loan_properties_notes",
    "Get property notes for an LSS loan",
    { account: z.string().describe("Loan account number") },
    async ({ account }) => {
      const data = await client.get(`/LSS.svc/GetLoanPropertiesNotes/${account}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
