import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { McpAppContext } from "../mcp/context.js";
import type { ToolModule } from "../mcp/tool.js";
import { jsonToolResult } from "../mcp/tool-result.js";
import { readAccountCart } from "../olaola/account/cart.js";

export const readAccountCartTool: ToolModule = {
  register(server: McpServer, context: McpAppContext): void {
    server.registerTool(
      "olaola_read_account_cart",
      {
        title: "Read OlaOla Account Cart",
        description: "Log into OlaOla with local env credentials and read the real account cart.",
        inputSchema: {},
      },
      async () => {
        const session = await context.accountService.createSession();
        return jsonToolResult(await readAccountCart(session.client));
      },
    );
  },
};
