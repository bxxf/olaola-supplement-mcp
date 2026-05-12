import { getOlaolaCredentialsFromEnv, type RuntimeEnv } from "../config.js";
import { OlaolaAccountService } from "../olaola/auth/session.js";
import { OlaolaCartService } from "../olaola/shadow-cart.js";

export interface McpAppContext {
  accountService: OlaolaAccountService;
  cartService: OlaolaCartService;
}

export interface McpAppContextOptions {
  env?: RuntimeEnv | undefined;
}

export function createMcpAppContext(options: McpAppContextOptions = {}): McpAppContext {
  return {
    accountService: new OlaolaAccountService(() => getOlaolaCredentialsFromEnv(options.env)),
    cartService: new OlaolaCartService(),
  };
}
