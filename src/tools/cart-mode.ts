import { z } from "zod";
import type { McpAppContext } from "../mcp/context.js";

export const cartModeSchema = z.enum(["auto", "account", "shadow"]);

export type CartMode = z.infer<typeof cartModeSchema>;

export async function shouldUseAccountCart(context: McpAppContext, mode: CartMode): Promise<boolean> {
  if (mode === "account") return true;
  if (mode === "shadow") return false;

  const status = await context.accountService.status();
  return status.configured && status.authenticated;
}
