import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerDivideNumbersTool } from "./divide-numbers.js";

export async function registerTools(server: McpServer) {
    await registerDivideNumbersTool(server);
}

