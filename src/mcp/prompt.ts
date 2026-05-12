import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { McpAppContext } from "./context.js";

export interface PromptModule {
  register(server: McpServer, context: McpAppContext): void;
}
