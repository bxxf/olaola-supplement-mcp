import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { McpAppContext } from "../mcp/context.js";
import type { ToolModule } from "../mcp/tool.js";
import { jsonToolResult } from "../mcp/tool-result.js";
import { fetchProductDetails } from "../olaola/product-details.js";

export const getProductDetailsTool: ToolModule = {
  register(server: McpServer, _context: McpAppContext): void {
    server.registerTool(
      "olaola_get_product_details",
      {
        title: "Get OlaOla Product Details",
        description:
          "Fetch normalized product facts plus OlaOla specification and usage modal text, including composition, ingredient amounts, warnings, and dosing when available.",
        inputSchema: {
          urlOrSlug: z.string().min(1),
        },
      },
      async ({ urlOrSlug }) => jsonToolResult(await fetchProductDetails(urlOrSlug)),
    );
  },
};
