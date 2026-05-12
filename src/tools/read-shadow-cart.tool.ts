import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { McpAppContext } from "../mcp/context.js";
import type { ToolModule } from "../mcp/tool.js";
import { jsonToolResult } from "../mcp/tool-result.js";

export const readShadowCartTool: ToolModule = {
  register(server: McpServer, context: McpAppContext): void {
    server.registerTool(
      "olaola_read_shadow_cart",
      {
        title: "Read OlaOla Shadow Cart",
        description: "Read the latest normalized snapshot of an anonymous shadow cart.",
        inputSchema: {
          cartId: z.string().uuid(),
        },
      },
      async (input) => jsonToolResult(context.cartService.readShadowCart(input)),
    );
  },
};
