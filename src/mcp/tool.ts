import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { McpAppContext } from "./context.js";

export interface ToolModule {
  register(server: McpServer, context: McpAppContext): void;
}
