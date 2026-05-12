import { describe, expect, it } from "vitest";
import { createHttpApp, createRuntimeEnvFromRequest } from "../src/server/http.js";

describe("HTTP MCP server", () => {
  it("exposes a health endpoint", async () => {
    const response = await createHttpApp().request("/health");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      status: "ok",
      name: "olaola-supplement-mcp",
      mcpPath: "/mcp",
    });
  });

  it("handles MCP initialize over Streamable HTTP", async () => {
    const response = await createHttpApp().request("/mcp", {
      method: "POST",
      headers: {
        accept: "application/json, text/event-stream",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2025-06-18",
          capabilities: {},
          clientInfo: {
            name: "vitest",
            version: "0.0.0",
          },
        },
      }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      jsonrpc: "2.0",
      id: 1,
      result: {
        serverInfo: {
          name: "olaola-supplement-mcp",
          version: "0.1.0",
        },
      },
    });
  });

  it("can read OlaOla credentials from HTTP headers", async () => {
    const request = new Request("https://example.com/mcp", {
      headers: {
        "olaola-email": "user@example.com",
        "olaola-password": "secret",
      },
    });

    const env = createRuntimeEnvFromRequest(request, undefined);

    expect(env.OLAOLA_EMAIL).toBe("user@example.com");
    expect(env.OLAOLA_PASSWORD).toBe("secret");
  });
});
