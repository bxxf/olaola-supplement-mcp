import { serve } from "@hono/node-server";
import { getHttpPort, getMcpTransportMode } from "./config.js";
import { createHttpApp } from "./server/http.js";
import { startStdioServer } from "./server/stdio.js";

if (getMcpTransportMode() === "http") {
  const port = getHttpPort();
  serve({
    fetch: createHttpApp().fetch,
    port,
  });

  console.error(`OlaOla MCP HTTP server listening on http://localhost:${port}/mcp`);
} else {
  await startStdioServer();
}
