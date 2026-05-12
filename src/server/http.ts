import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { Hono } from "hono";
import { getHttpPath, type RuntimeEnv, SERVER_NAME, SERVER_VERSION } from "../config.js";
import { createMcpServerFromRuntime } from "../mcp/app.js";

const OLAOLA_EMAIL_HEADER = "olaola-email";
const OLAOLA_PASSWORD_HEADER = "olaola-password";

export interface CreateHttpAppOptions {
  env?: RuntimeEnv | undefined;
}

export function createHttpApp(options: CreateHttpAppOptions = {}): Hono {
  const app = new Hono();
  const mcpPath = getHttpPath(options.env);

  app.get("/health", (context) =>
    context.json({
      status: "ok",
      name: SERVER_NAME,
      version: SERVER_VERSION,
      mcpPath,
    }),
  );

  app.all(mcpPath, async (context) => {
    const server = createMcpServerFromRuntime({
      env: createRuntimeEnvFromRequest(context.req.raw, options.env),
    });
    const transport = new WebStandardStreamableHTTPServerTransport({
      enableJsonResponse: true,
    });

    await server.connect(transport);

    try {
      return await transport.handleRequest(context.req.raw);
    } finally {
      await server.close();
    }
  });

  return app;
}

export function createRuntimeEnvFromRequest(request: Request, baseEnv: RuntimeEnv | undefined): RuntimeEnv {
  return {
    ...baseEnv,
    OLAOLA_EMAIL: request.headers.get(OLAOLA_EMAIL_HEADER) ?? baseEnv?.OLAOLA_EMAIL,
    OLAOLA_PASSWORD: request.headers.get(OLAOLA_PASSWORD_HEADER) ?? baseEnv?.OLAOLA_PASSWORD,
  };
}
