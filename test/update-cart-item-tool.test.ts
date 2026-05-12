import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it, vi } from "vitest";
import type { McpAppContext } from "../src/mcp/context.js";
import { removeFromCartTool } from "../src/tools/remove-from-cart.tool.js";
import { updateCartItemTool } from "../src/tools/update-cart-item.tool.js";

const mocks = vi.hoisted(() => ({
  updateAccountCartItem: vi.fn(async () => ({
    source: "user_cart",
    authenticated: true,
    items: [],
    subtotalCzk: null,
    itemCount: 0,
  })),
}));

vi.mock("../src/olaola/account/cart.js", () => ({
  updateAccountCartItem: mocks.updateAccountCartItem,
}));

describe("cart mutation tools", () => {
  it("updates the real account cart in auto mode when account auth works", async () => {
    const server = new ToolRegistryMock();
    const context = accountContext();

    updateCartItemTool.register(server.asMcpServer(), context);

    const result = await server.tools.get("olaola_update_cart_item")?.handler({
      confirmed: true,
      cartItemId: 12345,
      quantity: 2,
    });

    expect(mocks.updateAccountCartItem).toHaveBeenCalledWith({
      client: {},
      cartItemId: 12345,
      quantity: 2,
    });
    expect(JSON.parse(result?.content[0]?.text ?? "null")).toMatchObject({ mode: "account" });
  });

  it("removes from the real account cart by setting quantity to zero", async () => {
    const server = new ToolRegistryMock();
    const context = accountContext();

    removeFromCartTool.register(server.asMcpServer(), context);

    await server.tools.get("olaola_remove_from_cart")?.handler({
      confirmed: true,
      cartItemId: 12345,
    });

    expect(mocks.updateAccountCartItem).toHaveBeenCalledWith({
      client: {},
      cartItemId: 12345,
      quantity: 0,
    });
  });

  it("requires confirmation before mutating the real account cart", async () => {
    const server = new ToolRegistryMock();
    const context = accountContext();

    updateCartItemTool.register(server.asMcpServer(), context);

    await expect(
      server.tools.get("olaola_update_cart_item")?.handler({
        cartItemId: 12345,
        quantity: 2,
      }),
    ).rejects.toThrow("confirmed=true");
  });
});

function accountContext(): McpAppContext {
  return {
    accountService: {
      status: vi.fn(async () => ({ configured: true, authenticated: true })),
      createSession: vi.fn(async () => ({ client: {} })),
    },
    cartService: {
      updateShadowCartItem: vi.fn(),
    },
  } as unknown as McpAppContext;
}

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
    cartItemId: number;
    quantity?: number;
  }) => Promise<{ content: Array<{ text: string }> }>;
}
