import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { OlaolaToolInputError } from "../errors.js";
import type { McpAppContext } from "../mcp/context.js";
import type { ToolModule } from "../mcp/tool.js";
import { jsonToolResult } from "../mcp/tool-result.js";
import { addToAccountCart } from "../olaola/account/cart.js";

export const addToAccountCartTool: ToolModule = {
  register(server: McpServer, context: McpAppContext): void {
    server.registerTool(
      "olaola_add_to_account_cart",
      {
        title: "Add To OlaOla Account Cart",
        description:
          "Log into OlaOla with local env credentials, add a product to the real account cart, and return the updated cart. Requires confirmed=true.",
        inputSchema: {
          confirmed: z.boolean(),
          variantId: z.number().int().positive().optional(),
          productUrlOrSlug: z.string().min(1).optional(),
          quantity: z.number().int().min(1).max(99).optional(),
        },
      },
      async ({ confirmed, variantId, productUrlOrSlug, quantity }) => {
        if (!confirmed) {
          throw new OlaolaToolInputError("Refusing to modify the real OlaOla account cart without confirmed=true.");
        }

        const session = await context.accountService.createSession();
        return jsonToolResult(
          await addToAccountCart({
            client: session.client,
            variantId,
            productUrlOrSlug,
            quantity,
          }),
        );
      },
    );
  },
};
