import { z } from "zod";
import type { TmoClient } from "../client.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerLssEventTools(server: McpServer, client: TmoClient) {
  server.tool(
    "lss_get_events_journal",
    "Query the events journal with optional filters",
    {
      sourceModule: z.string().optional().describe("Source module filter (e.g. Insurance, Payment)"),
      fromDateTime: z.string().optional().describe("Start datetime filter"),
      toDateTime: z.string().optional().describe("End datetime filter"),
      order: z.string().optional().describe("Sort order (asc/desc)"),
      userId: z.string().optional().describe("Filter by user ID"),
      recId: z.string().optional().describe("Filter by record ID"),
    },
    async ({ sourceModule, fromDateTime, toDateTime, order, userId, recId }) => {
      const data = await client.get("/LSS.svc/events-journal", {
        sourceModule,
        fromDateTime,
        toDateTime,
        order,
        userID: userId,
        recID: recId,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_create_event_journal_entries",
    "Create one or more event journal entries",
    { entries: z.array(z.record(z.unknown())).describe("Array of event journal entry objects (CEventJournal)") },
    async ({ entries }) => {
      const data = await client.post("/LSS.svc/events-journal", entries);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
