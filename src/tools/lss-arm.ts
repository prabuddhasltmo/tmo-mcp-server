import { z } from "zod";
import type { TmoClient } from "../client.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerLssArmTools(server: McpServer, client: TmoClient) {
  server.tool(
    "lss_get_arm_indexes",
    "Get ARM indexes with optional audit date filters",
    {
      createdAfter: z.string().optional(),
      createdBefore: z.string().optional(),
      sysTimeStampAfter: z.string().optional(),
      sysTimeStampBefore: z.string().optional(),
    },
    async ({ createdAfter, createdBefore, sysTimeStampAfter, sysTimeStampBefore }) => {
      const data = await client.get("/LSS.svc/GetARMIndexes", {
        createdAfter,
        createdBefore,
        sysTimeStampAfter,
        sysTimeStampBefore,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_new_arm_index",
    "Create a new ARM index",
    { index: z.record(z.unknown()).describe("ARM index object (CIndex)") },
    async ({ index }) => {
      const data = await client.post("/LSS.svc/NewARMIndex", index);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_update_arm_index",
    "Update an existing ARM index",
    { index: z.record(z.unknown()).describe("ARM index object with RecID") },
    async ({ index }) => {
      const data = await client.post("/LSS.svc/UpdateARMIndex", index);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_new_arm_rate",
    "Create a new ARM rate for an index",
    { rate: z.record(z.unknown()).describe("ARM rate object (CRate)") },
    async ({ rate }) => {
      const data = await client.post("/LSS.svc/NewARMRate", rate);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_update_arm_rate",
    "Update an existing ARM rate",
    { rate: z.record(z.unknown()).describe("ARM rate object with RecID") },
    async ({ rate }) => {
      const data = await client.post("/LSS.svc/UpdateARMRate", rate);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
