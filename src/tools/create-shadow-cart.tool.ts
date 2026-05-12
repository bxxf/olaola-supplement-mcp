import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { McpAppContext } from "../mcp/context.js";
import type { ToolModule } from "../mcp/tool.js";
import { jsonToolResult } from "../mcp/tool-result.js";

export const createShadowCartTool: ToolModule = {
  register(server: McpServer, context: McpAppContext): void {
    server.registerTool(
      "olaola_create_shadow_cart",
      {
        title: "Create OlaOla Shadow Cart",
        description:
          "Create an anonymous OlaOla planning/simulation cart. Use only when the user wants a shadow cart or credentials are unavailable; the cookie stays internal to this MCP process.",
        inputSchema: {
          seedUrl: z.string().url().optional(),
        },
      },
      async ({ seedUrl }) => {
        const cart = await context.cartService.createShadowCart(seedUrl);
        return jsonToolResult({
          cartId: cart.id,
          createdAt: cart.createdAt.toISOString(),
          note: "Cookie is intentionally not exported.",
        });
      },
    );
  },
};
