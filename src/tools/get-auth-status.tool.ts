import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { McpAppContext } from "../mcp/context.js";
import type { ToolModule } from "../mcp/tool.js";
import { jsonToolResult } from "../mcp/tool-result.js";

export const getAuthStatusTool: ToolModule = {
  register(server: McpServer, context: McpAppContext): void {
    server.registerTool(
      "olaola_get_auth_status",
      {
        title: "Get OlaOla Auth Status",
        description: "Check whether OlaOla account credentials are configured and whether login succeeds.",
        inputSchema: {},
      },
      async () => jsonToolResult(await context.accountService.status()),
    );
  },
};
