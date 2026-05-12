import type { OlaolaCredentials } from "../../config.js";
import { getOlaolaCredentialsFromEnv, OLAOLA_AJAX_URL, OLAOLA_LOGIN_URL } from "../../config.js";
import { OlaolaAuthError, OlaolaParseError } from "../../errors.js";
import { HttpClient } from "../../http/client.js";
import { CookieJar } from "../../http/cookie-jar.js";
import { stripHtml } from "../../utils/text.js";
import { extractAjaxNonce } from "../product/modal.js";

export interface AuthStatus {
  configured: boolean;
  authenticated: boolean;
  email: string | null;
  message: string;
}

export interface AccountSession {
  client: HttpClient;
  email: string;
}

interface GhostpressFormResponse {
  success?: boolean;
  data?: {
    form?: {
      is_valid?: boolean;
      has_alerts?: boolean;
    };
    fragments?: {
      replace?: Record<string, string>;
    };
    redirect_url?: string;
  };
}

export class OlaolaAccountService {
  constructor(private readonly getCredentials = getOlaolaCredentialsFromEnv) {}

  async status(): Promise<AuthStatus> {
    const credentials = this.getCredentials();
    if (!credentials) {
      return {
        configured: false,
        authenticated: false,
        email: null,
        message: "Set OLAOLA_EMAIL and OLAOLA_PASSWORD in the MCP client environment to enable account tools.",
      };
    }

    try {
      await this.login(credentials);
      return {
        configured: true,
        authenticated: true,
        email: credentials.email,
        message: "OlaOla login succeeded.",
      };
    } catch (error) {
      return {
        configured: true,
        authenticated: false,
        email: credentials.email,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async createSession(): Promise<AccountSession> {
    const credentials = this.getCredentials();
    if (!credentials) {
      throw new OlaolaAuthError("OlaOla credentials are not configured. Set OLAOLA_EMAIL and OLAOLA_PASSWORD.");
    }

    const client = await this.login(credentials);
    return {
      client,
      email: credentials.email,
    };
  }

  private async login(credentials: OlaolaCredentials): Promise<HttpClient> {
    const cookieJar = new CookieJar();
    const client = new HttpClient({ cookieJar });
    const loginPageHtml = await client.getText(OLAOLA_LOGIN_URL);
    const ajaxNonce = extractAjaxNonce(loginPageHtml);

    if (!ajaxNonce) {
      throw new OlaolaParseError("Could not extract OlaOla login nonce.");
    }

    const responseText = await client.postMultipartText(OLAOLA_AJAX_URL, {
      action: "form",
      form_id: "customer-sign-in",
      event: "submit",
      email: credentials.email,
      password: credentials.password,
      remember: 1,
      submit: "",
      _ajax_nonce: ajaxNonce,
    });

    const response = parseGhostpressFormResponse(responseText);
    const alertText = extractAlertText(response);

    if (!response.success || isLoginFailure(alertText)) {
      throw new OlaolaAuthError(alertText || "OlaOla login failed.");
    }

    return client;
  }
}

function parseGhostpressFormResponse(responseText: string): GhostpressFormResponse {
  try {
    return JSON.parse(responseText) as GhostpressFormResponse;
  } catch (error) {
    throw new OlaolaParseError("OlaOla login response was not valid JSON.", { cause: error });
  }
}

function isLoginFailure(alertText: string | null): boolean {
  if (!alertText) return false;
  return !alertText.toLocaleLowerCase("cs-CZ").includes("úspěšně přihlášen");
}

function extractAlertText(response: GhostpressFormResponse): string | null {
  const fragments = response.data?.fragments?.replace;
  if (!fragments) return null;

  for (const [selector, html] of Object.entries(fragments)) {
    if (!selector.includes("alerts")) continue;

    const text = stripHtml(html);
    if (text) return text;
  }

  return null;
}
