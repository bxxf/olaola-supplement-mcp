import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { McpAppContext } from "../mcp/context.js";
import type { ToolModule } from "../mcp/tool.js";
import { jsonToolResult } from "../mcp/tool-result.js";
import { generateQuickBuyUrl } from "../olaola/quick-buy.js";

export const generateQuickBuyUrlTool: ToolModule = {
  register(server: McpServer, _context: McpAppContext): void {
    server.registerTool(
      "olaola_generate_quick_buy_url",
      {
        title: "Generate OlaOla Quick-Buy URL",
        description: "Generate a public OlaOla quick-buy URL from variant IDs and/or product URLs.",
        inputSchema: {
          variantIds: z.array(z.number().int().positive()).optional(),
          productUrlsOrSlugs: z.array(z.string().min(1)).optional(),
        },
      },
      async (input) => jsonToolResult(await generateQuickBuyUrl(input)),
    );
  },
};
