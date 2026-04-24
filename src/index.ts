import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { TmoClient } from "./client.js";
import { registerAllTools } from "./register-tools.js";
import { registerCredentialsTools } from "./tools/credentials.js";

const client = new TmoClient();
const server = new McpServer({ name: "tmo-api", version: "1.0.0" });

registerAllTools(server, client);
// Credential-switching tools only make sense in local/stdio mode (per-session runtime switching)
registerCredentialsTools(server, client);

const transport = new StdioServerTransport();
await server.connect(transport);
