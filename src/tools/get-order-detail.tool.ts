import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { McpAppContext } from "../mcp/context.js";
import type { ToolModule } from "../mcp/tool.js";
import { jsonToolResult } from "../mcp/tool-result.js";
import { fetchOrderDetail } from "../olaola/account/orders.js";

export const getOrderDetailTool: ToolModule = {
  register(server: McpServer, context: McpAppContext): void {
    server.registerTool(
      "olaola_get_order_detail",
      {
        title: "Get OlaOla Order Detail",
        description: "Log into OlaOla with local env credentials and fetch one order detail.",
        inputSchema: {
          orderNumber: z.string().min(1),
        },
      },
      async ({ orderNumber }) => {
        const session = await context.accountService.createSession();
        return jsonToolResult(await fetchOrderDetail({ client: session.client, orderNumber }));
      },
    );
  },
};
