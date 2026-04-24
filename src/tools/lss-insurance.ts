import { z } from "zod";
import type { TmoClient } from "../client.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const auditParams = {
  createdAfter: z.string().optional().describe("Filter records created after this datetime"),
  createdBefore: z.string().optional().describe("Filter records created before this datetime"),
  sysTimeStampAfter: z.string().optional().describe("Filter by system timestamp after"),
  sysTimeStampBefore: z.string().optional().describe("Filter by system timestamp before"),
};

export function registerLssInsuranceTools(server: McpServer, client: TmoClient) {
  server.tool(
    "lss_get_insurances",
    "Get insurance records for a property",
    {
      propertyRecId: z.string().describe("Property record ID"),
      ...auditParams,
    },
    async ({ propertyRecId, createdAfter, createdBefore, sysTimeStampAfter, sysTimeStampBefore }) => {
      const data = await client.get(`/LSS.svc/GetInsurances/${propertyRecId}`, {
        createdAfter,
        createdBefore,
        sysTimeStampAfter,
        sysTimeStampBefore,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_search_insurances",
    "Search insurance records by record IDs or property record IDs",
    {
      recIds: z.string().optional().describe("Comma-separated insurance record IDs"),
      propertyRecIds: z.string().optional().describe("Comma-separated property record IDs"),
    },
    async ({ recIds, propertyRecIds }) => {
      const data = await client.get("/LSS.svc/GetSearchInsurances", { recIds, propertyRecIds });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_new_insurance",
    "Create a new insurance record",
    { insurance: z.record(z.unknown()).describe("Insurance object (CInsurance)") },
    async ({ insurance }) => {
      const data = await client.post("/LSS.svc/NewInsurance", insurance);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_update_insurance",
    "Update an insurance record",
    { insurance: z.record(z.unknown()).describe("Insurance object with RecID") },
    async ({ insurance }) => {
      const data = await client.post("/LSS.svc/UpdateInsurance", insurance);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_delete_insurance",
    "Delete an insurance record by RecID",
    { recId: z.string().describe("Insurance record ID") },
    async ({ recId }) => {
      const data = await client.delete(`/LSS.svc/DeleteInsurance/${recId}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
