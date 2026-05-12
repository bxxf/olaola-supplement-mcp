import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { McpAppContext } from "../mcp/context.js";
import type { ToolModule } from "../mcp/tool.js";
import { jsonToolResult } from "../mcp/tool-result.js";
import { retrieveProductsForModel } from "../olaola/product-retrieval.js";

export const searchProductsTool: ToolModule = {
  register(server: McpServer, _context: McpAppContext): void {
    server.registerTool(
      "olaola_search_products",
      {
        title: "Search OlaOla Products",
        description:
          "Search OlaOla for real product candidates using storefront search plus the product sitemap. Product candidates can be opened, inspected, or added to carts. WP product-content context is disabled by default and must be explicitly requested.",
        inputSchema: {
          queries: z.array(z.string().min(1)).min(1).max(10),
          maxPerQuery: z.number().int().min(1).max(20).optional(),
          maxContentHintsPerQuery: z.number().int().min(0).max(10).optional(),
          includeContentHints: z.boolean().optional(),
        },
      },
      async ({ queries, maxPerQuery, maxContentHintsPerQuery, includeContentHints }) =>
        jsonToolResult(
          await retrieveProductsForModel({ queries, maxPerQuery, maxContentHintsPerQuery, includeContentHints }),
        ),
    );
  },
};
