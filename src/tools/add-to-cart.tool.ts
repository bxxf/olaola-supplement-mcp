import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { OlaolaToolInputError } from "../errors.js";
import type { McpAppContext } from "../mcp/context.js";
import type { ToolModule } from "../mcp/tool.js";
import { jsonToolResult } from "../mcp/tool-result.js";
import { addToAccountCart } from "../olaola/account/cart.js";
import { cartModeSchema, shouldUseAccountCart } from "./cart-mode.js";

export const addToCartTool: ToolModule = {
  register(server: McpServer, context: McpAppContext): void {
    server.registerTool(
      "olaola_add_to_cart",
      {
        title: "Add To OlaOla Cart",
        description:
          "Add a product to the user's OlaOla cart. In auto mode, use the real account cart when credentials are configured; otherwise create/use a shadow cart. Real account cart changes require confirmed=true.",
        inputSchema: {
          mode: cartModeSchema.optional(),
          confirmed: z.boolean().optional(),
          cartId: z.string().uuid().optional(),
          variantId: z.number().int().positive().optional(),
          productUrlOrSlug: z.string().min(1).optional(),
          quantity: z.number().int().min(1).max(99).optional(),
        },
      },
      async (input) => jsonToolResult(await addToPreferredCart(context, input)),
    );
  },
};

async function addToPreferredCart(
  context: McpAppContext,
  input: {
    mode?: "auto" | "account" | "shadow" | undefined;
    confirmed?: boolean | undefined;
    cartId?: string | undefined;
    variantId?: number | undefined;
    productUrlOrSlug?: string | undefined;
    quantity?: number | undefined;
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
      cart: await addToAccountCart({
        client: session.client,
        variantId: input.variantId,
        productUrlOrSlug: input.productUrlOrSlug,
        quantity: input.quantity,
      }),
    };
  }

  const shadowCart = input.cartId ? null : await context.cartService.createShadowCart();
  const cartId = input.cartId ?? shadowCart?.id;
  if (!cartId) {
    throw new OlaolaToolInputError("Shadow cart mode requires cartId or permission to create a new shadow cart.");
  }

  return {
    mode: "shadow",
    cartId,
    cart: await context.cartService.addToShadowCart({
      cartId,
      variantId: input.variantId,
      productUrlOrSlug: input.productUrlOrSlug,
      quantity: input.quantity,
    }),
  };
}
