export const OLAOLA_BASE_URL = "https://www.olaola.cz";
export const OLAOLA_AJAX_URL = `${OLAOLA_BASE_URL}/wp-admin/admin-ajax.php?lang=cs`;
export const OLAOLA_LOGIN_URL = `${OLAOLA_BASE_URL}/prihlaseni/`;

export const DEFAULT_USER_AGENT = "olaola-supplement-mcp/0.1 (+https://modelcontextprotocol.io)";
export const SERVER_NAME = "olaola-supplement-mcp";
export const SERVER_VERSION = "0.1.0";

export type McpTransportMode = "stdio" | "http";

export interface OlaolaCredentials {
  email: string;
  password: string;
}

export interface RuntimeEnv {
  MCP_TRANSPORT?: string | undefined;
  MCP_HTTP_PATH?: string | undefined;
  PORT?: string | undefined;
  OLAOLA_EMAIL?: string | undefined;
  OLAOLA_PASSWORD?: string | undefined;
}

export function getMcpTransportMode(env = getProcessEnv()): McpTransportMode {
  return env.MCP_TRANSPORT === "http" ? "http" : "stdio";
}

export function getHttpPort(env = getProcessEnv()): number {
  return parseIntegerEnv(env.PORT) ?? 3000;
}

export function getHttpPath(env = getProcessEnv()): string {
  const path = env.MCP_HTTP_PATH?.trim();
  if (!path) return "/mcp";
  return path.startsWith("/") ? path : `/${path}`;
}

export function getOlaolaCredentialsFromEnv(env = getProcessEnv()): OlaolaCredentials | null {
  const email = env.OLAOLA_EMAIL?.trim();
  const password = env.OLAOLA_PASSWORD;

  if (!email || !password) return null;
  return { email, password };
}

function getProcessEnv(): RuntimeEnv {
  return typeof process === "undefined" ? {} : process.env;
}

function parseIntegerEnv(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) ? parsed : null;
}
