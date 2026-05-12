import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { McpAppContext } from "../mcp/context.js";
import type { ToolModule } from "../mcp/tool.js";
import { addToAccountCartTool } from "./add-to-account-cart.tool.js";
import { addToCartTool } from "./add-to-cart.tool.js";
import { addToShadowCartTool } from "./add-to-shadow-cart.tool.js";
import { createShadowCartTool } from "./create-shadow-cart.tool.js";
import { generateQuickBuyUrlTool } from "./generate-quick-buy-url.tool.js";
import { getAuthStatusTool } from "./get-auth-status.tool.js";
import { getOrderDetailTool } from "./get-order-detail.tool.js";
import { getOrderHistoryTool } from "./get-order-history.tool.js";
import { getProductTool } from "./get-product.tool.js";
import { getProductDetailsTool } from "./get-product-details.tool.js";
import { readAccountCartTool } from "./read-account-cart.tool.js";
import { readShadowCartTool } from "./read-shadow-cart.tool.js";
import { removeFromCartTool } from "./remove-from-cart.tool.js";
import { searchProductContentTool } from "./search-product-content.tool.js";
import { searchProductsTool } from "./search-products.tool.js";
import { updateCartItemTool } from "./update-cart-item.tool.js";

const tools: ToolModule[] = [
  getAuthStatusTool,
  getOrderHistoryTool,
  getOrderDetailTool,
  readAccountCartTool,
  addToCartTool,
  updateCartItemTool,
  removeFromCartTool,
  addToAccountCartTool,
  getProductTool,
  getProductDetailsTool,
  searchProductsTool,
  searchProductContentTool,
  createShadowCartTool,
  addToShadowCartTool,
  readShadowCartTool,
  generateQuickBuyUrlTool,
];

export function registerTools(server: McpServer, context: McpAppContext): void {
  for (const tool of tools) {
    tool.register(server, context);
  }
}
