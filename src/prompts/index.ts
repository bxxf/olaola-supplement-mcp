import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { McpAppContext } from "../mcp/context.js";
import type { PromptModule } from "../mcp/prompt.js";
import { supplementIntakePrompt } from "./supplement-intake.prompt.js";

const prompts: PromptModule[] = [supplementIntakePrompt];

export function registerPrompts(server: McpServer, context: McpAppContext): void {
  for (const prompt of prompts) {
    prompt.register(server, context);
  }
}
