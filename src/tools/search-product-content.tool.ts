import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { McpAppContext } from "../mcp/context.js";
import type { ToolModule } from "../mcp/tool.js";
import { jsonToolResult } from "../mcp/tool-result.js";
import { fetchProductContentHints, type ProductContentHint } from "../olaola/wp-product-content.js";

interface ProductContentSearchPacket {
  query: string;
  hints: ProductContentHint[];
}

export const searchProductContentTool: ToolModule = {
  register(server: McpServer, _context: McpAppContext): void {
    server.registerTool(
      "olaola_search_product_content",
      {
        title: "Search OlaOla Product Content",
        description:
          "Search public OlaOla WP product_content entries for supplemental text context. Use short Czech queries such as energie, únava, hořčík, psychická pohoda, ashwagandha. Results are text context only, not directly cartable products.",
        inputSchema: {
          query: z.string().min(1).optional(),
          queries: z.array(z.string().min(1)).min(1).max(10).optional(),
          maxHints: z.number().int().min(1).max(20).optional(),
        },
      },
      async ({ query, queries, maxHints }) =>
        jsonToolResult(await searchProductContent({ query, queries, maxHints: maxHints ?? 8 })),
    );
  },
};

async function searchProductContent(input: {
  query: string | undefined;
  queries: string[] | undefined;
  maxHints: number;
}): Promise<ProductContentSearchPacket[]> {
  const queries = normalizeQueries(input);
  const packets: ProductContentSearchPacket[] = [];

  for (const query of queries) {
    packets.push({
      query,
      hints: await fetchProductContentHints({ query, maxHints: input.maxHints }),
    });
  }

  return packets;
}

function normalizeQueries(input: { query: string | undefined; queries: string[] | undefined }): string[] {
  const values = [...(input.queries ?? []), input.query].filter((value): value is string => Boolean(value?.trim()));
  return [...new Set(values.map((query) => query.trim()).filter(Boolean))];
}
