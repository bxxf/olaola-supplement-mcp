import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { McpAppContext } from "../mcp/context.js";
import type { ToolModule } from "../mcp/tool.js";
import { jsonToolResult } from "../mcp/tool-result.js";
import { fetchProductFacts } from "../olaola/product-parser.js";

export const getProductTool: ToolModule = {
  register(server: McpServer, _context: McpAppContext): void {
    server.registerTool(
      "olaola_get_product",
      {
        title: "Get OlaOla Product",
        description: "Fetch and normalize public OlaOla product facts from a URL or product slug.",
        inputSchema: {
          urlOrSlug: z.string().min(1),
        },
      },
      async ({ urlOrSlug }) => jsonToolResult(await fetchProductFacts(urlOrSlug)),
    );
  },
};
