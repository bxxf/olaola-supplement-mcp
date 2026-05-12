import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { McpAppContext } from "../mcp/context.js";
import type { ToolModule } from "../mcp/tool.js";
import { jsonToolResult } from "../mcp/tool-result.js";
import { fetchOrderHistory } from "../olaola/account/orders.js";

export const getOrderHistoryTool: ToolModule = {
  register(server: McpServer, context: McpAppContext): void {
    server.registerTool(
      "olaola_get_order_history",
      {
        title: "Get OlaOla Order History",
        description: "Log into OlaOla with local env credentials and fetch account order summaries.",
        inputSchema: {},
      },
      async () => {
        const session = await context.accountService.createSession();
        return jsonToolResult(await fetchOrderHistory(session.client));
      },
    );
  },
};
