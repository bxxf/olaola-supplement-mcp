import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpServerFromRuntime } from "../mcp/app.js";

export async function startStdioServer(): Promise<void> {
  const server = createMcpServerFromRuntime();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
