/**
 * Registers all TMO API tool groups on a McpServer instance.
 * Called with a per-connection TmoClient so the HTTP server can
 * isolate credentials across concurrent sessions.
 */
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TmoClient } from "./client.js";

import { registerLosTools } from "./tools/los.js";
import { registerLssLoanTools } from "./tools/lss-loans.js";
import { registerLssPaymentTools } from "./tools/lss-payments.js";
import { registerLssPropertyTools } from "./tools/lss-properties.js";
import { registerLssInsuranceTools } from "./tools/lss-insurance.js";
import { registerLssChargeTools } from "./tools/lss-charges.js";
import { registerLssEscrowTools } from "./tools/lss-escrow.js";
import { registerLssTrustTools } from "./tools/lss-trust.js";
import { registerLssLenderTools } from "./tools/lss-lenders.js";
import { registerLssAttachmentTools } from "./tools/lss-attachments.js";
import { registerLssHistoryTools } from "./tools/lss-history.js";
import { registerLssConversationTools } from "./tools/lss-conversations.js";
import { registerLssArmTools } from "./tools/lss-arm.js";
import { registerLssFundingTools } from "./tools/lss-funding.js";
import { registerLssEventTools } from "./tools/lss-events.js";
import { registerSharesTools } from "./tools/shares.js";
import { registerCapitalTools } from "./tools/capital.js";

export function registerAllTools(server: McpServer, client: TmoClient): void {
  registerLosTools(server, client);
  registerLssLoanTools(server, client);
  registerLssPaymentTools(server, client);
  registerLssPropertyTools(server, client);
  registerLssInsuranceTools(server, client);
  registerLssChargeTools(server, client);
  registerLssEscrowTools(server, client);
  registerLssTrustTools(server, client);
  registerLssLenderTools(server, client);
  registerLssAttachmentTools(server, client);
  registerLssHistoryTools(server, client);
  registerLssConversationTools(server, client);
  registerLssArmTools(server, client);
  registerLssFundingTools(server, client);
  registerLssEventTools(server, client);
  registerSharesTools(server, client);
  registerCapitalTools(server, client);
}
