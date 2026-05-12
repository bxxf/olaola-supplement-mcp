import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SERVER_NAME, SERVER_VERSION } from "../config.js";
import { registerPrompts } from "../prompts/index.js";
import { registerTools } from "../tools/index.js";
import { createMcpAppContext, type McpAppContext, type McpAppContextOptions } from "./context.js";

export function createMcpServer(context: McpAppContext = createMcpAppContext()): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  registerTools(server, context);
  registerPrompts(server, context);

  return server;
}

export function createMcpServerFromRuntime(options: McpAppContextOptions = {}): McpServer {
  return createMcpServer(createMcpAppContext(options));
}
