import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { McpAppContext } from "../mcp/context.js";
import type { ToolModule } from "../mcp/tool.js";
import { jsonToolResult } from "../mcp/tool-result.js";

export const addToShadowCartTool: ToolModule = {
  register(server: McpServer, context: McpAppContext): void {
    server.registerTool(
      "olaola_add_to_shadow_cart",
      {
        title: "Add To OlaOla Shadow Cart",
        description:
          "Add a product variant or public product URL to an anonymous planning/simulation cart. Do not use this for the user's real cart; use olaola_add_to_cart or olaola_add_to_account_cart for that.",
        inputSchema: {
          cartId: z.string().uuid(),
          variantId: z.number().int().positive().optional(),
          productUrlOrSlug: z.string().min(1).optional(),
          quantity: z.number().int().min(1).max(99).optional(),
        },
      },
      async (input) => jsonToolResult(await context.cartService.addToShadowCart(input)),
    );
  },
};
