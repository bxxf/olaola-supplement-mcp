import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it, vi } from "vitest";
import type { McpAppContext } from "../src/mcp/context.js";
import { searchProductContentTool } from "../src/tools/search-product-content.tool.js";

vi.mock("../src/olaola/wp-product-content.js", () => ({
  fetchProductContentHints: vi.fn(async () => [
    {
      position: 1,
      wpId: 20247,
      slug: "auto-draft-319",
      url: "https://www.olaola.cz/product-content/auto-draft-319/",
      title: "Elektrolyty",
      snippet: "Podpora energie a hydratace.",
    },
  ]),
}));

describe("olaola_search_product_content tool", () => {
  it("registers a content-hint-only search tool", async () => {
    const server = new ToolRegistryMock();
    searchProductContentTool.register(server.asMcpServer(), {} as McpAppContext);

    const registered = server.tools.get("olaola_search_product_content");
    expect(registered?.config.description).toContain("text context only");

    const result = await registered?.handler({ query: "energie", maxHints: 1 });
    expect(JSON.parse(result?.content[0]?.text ?? "null")).toEqual([
      {
        query: "energie",
        hints: [
          {
            position: 1,
            wpId: 20247,
            slug: "auto-draft-319",
            url: "https://www.olaola.cz/product-content/auto-draft-319/",
            title: "Elektrolyty",
            snippet: "Podpora energie a hydratace.",
          },
        ],
      },
    ]);
  });

  it("does not infer extra keywords from long queries", async () => {
    const server = new ToolRegistryMock();
    searchProductContentTool.register(server.asMcpServer(), {} as McpAppContext);

    const result = await server.tools
      .get("olaola_search_product_content")
      ?.handler({ query: "stress psychická pohoda duševní pohoda nálada", maxHints: 1 });

    expect(JSON.parse(result?.content[0]?.text ?? "null").map((packet: { query: string }) => packet.query)).toEqual([
      "stress psychická pohoda duševní pohoda nálada",
    ]);
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
    query?: string;
    queries?: string[];
    maxHints?: number;
  }) => Promise<{ content: Array<{ text: string }> }>;
}
