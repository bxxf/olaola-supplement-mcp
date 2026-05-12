import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it, vi } from "vitest";
import type { McpAppContext } from "../src/mcp/context.js";
import { addToCartTool } from "../src/tools/add-to-cart.tool.js";

vi.mock("../src/olaola/account/cart.js", () => ({
  addToAccountCart: vi.fn(async () => ({
    source: "user_cart",
    authenticated: true,
    items: [],
    subtotalCzk: null,
    itemCount: 0,
  })),
}));

describe("olaola_add_to_cart tool", () => {
  it("uses the real account cart in auto mode when account auth works", async () => {
    const server = new ToolRegistryMock();
    const context = {
      accountService: {
        status: vi.fn(async () => ({ configured: true, authenticated: true })),
        createSession: vi.fn(async () => ({ client: {} })),
      },
      cartService: {
        createShadowCart: vi.fn(),
        addToShadowCart: vi.fn(),
      },
    } as unknown as McpAppContext;

    addToCartTool.register(server.asMcpServer(), context);

    const result = await server.tools.get("olaola_add_to_cart")?.handler({
      confirmed: true,
      productUrlOrSlug: "omega-3-90-kapsli",
    });

    expect(JSON.parse(result?.content[0]?.text ?? "null")).toMatchObject({
      mode: "account",
      cart: {
        source: "user_cart",
        authenticated: true,
      },
    });
    expect(context.cartService.createShadowCart).not.toHaveBeenCalled();
  });
});

class ToolRegistryMock {
  readonly tools = new Map<string, RegisteredTool>();

  asMcpServer(): McpServer {
    return {
      registerTool: (name: string, config: RegisteredTool["config"], handler: RegisteredTool["handler"]) => {
        this.tools.set(name, { config, handler });
      },
    } as unknown as McpServer;
  }
}

interface RegisteredTool {
  config: { description?: string };
  handler: (input: {
    mode?: "auto" | "account" | "shadow";
    confirmed?: boolean;
    cartId?: string;
    variantId?: number;
    productUrlOrSlug?: string;
    quantity?: number;
  }) => Promise<{ content: Array<{ text: string }> }>;
}
