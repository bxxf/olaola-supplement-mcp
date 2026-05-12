import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { OlaolaToolInputError } from "../errors.js";
import type { McpAppContext } from "../mcp/context.js";
import type { ToolModule } from "../mcp/tool.js";
import { jsonToolResult } from "../mcp/tool-result.js";
import { updateAccountCartItem } from "../olaola/account/cart.js";
import { cartModeSchema, shouldUseAccountCart } from "./cart-mode.js";

export const updateCartItemTool: ToolModule = {
  register(server: McpServer, context: McpAppContext): void {
    server.registerTool(
      "olaola_update_cart_item",
      {
        title: "Update OlaOla Cart Item",
        description:
          "Set the quantity for an existing OlaOla cart line item. Read the cart first, then pass the item's cartItemId. In auto mode, use the real account cart when credentials work; real cart changes require confirmed=true.",
        inputSchema: {
          mode: cartModeSchema.optional(),
          confirmed: z.boolean().optional(),
          cartId: z.string().uuid().optional(),
          cartItemId: z.number().int().positive(),
          quantity: z.number().int().min(1).max(99),
        },
      },
      async (input) => jsonToolResult(await updateCartItem(context, input)),
    );
  },
};

async function updateCartItem(
  context: McpAppContext,
  input: {
    mode?: "auto" | "account" | "shadow" | undefined;
    confirmed?: boolean | undefined;
    cartId?: string | undefined;
    cartItemId: number;
    quantity: number;
  },
): Promise<unknown> {
  const mode = input.mode ?? "auto";

  if (await shouldUseAccountCart(context, mode)) {
    if (!input.confirmed) {
      throw new OlaolaToolInputError("Refusing to modify the real OlaOla account cart without confirmed=true.");
    }

    const session = await context.accountService.createSession();
    return {
      mode: "account",
      cart: await updateAccountCartItem({
        client: session.client,
        cartItemId: input.cartItemId,
        quantity: input.quantity,
      }),
    };
  }

  if (!input.cartId) {
    throw new OlaolaToolInputError("Shadow cart mode requires cartId.");
  }

  return {
    mode: "shadow",
    cartId: input.cartId,
    cart: await context.cartService.updateShadowCartItem({
      cartId: input.cartId,
      cartItemId: input.cartItemId,
      quantity: input.quantity,
    }),
  };
}
