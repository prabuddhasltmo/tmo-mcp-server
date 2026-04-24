import { z } from "zod";
import type { TmoClient } from "../client.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerLssConversationTools(server: McpServer, client: TmoClient) {
  server.tool(
    "lss_get_loan_conversations",
    "Get memos/conversations for an LSS loan",
    { account: z.string().describe("Loan account number") },
    async ({ account }) => {
      const data = await client.get(`/LSS.svc/GetLoanConversations/${account}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_new_conversation",
    "Create a new conversation/memo on an LSS loan",
    { conversation: z.record(z.unknown()).describe("Conversation object (CConversation)") },
    async ({ conversation }) => {
      const data = await client.post("/LSS.svc/NewConversation", conversation);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_update_conversation",
    "Update an existing conversation/memo",
    { conversation: z.record(z.unknown()).describe("Conversation object with RecID") },
    async ({ conversation }) => {
      const data = await client.post("/LSS.svc/UpdateConversation", conversation);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lss_new_reminders",
    "Create one or more reminders (batch)",
    { reminders: z.array(z.record(z.unknown())).describe("Array of reminder objects") },
    async ({ reminders }) => {
      const data = await client.post("/LSS.svc/NewReminders", reminders);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
