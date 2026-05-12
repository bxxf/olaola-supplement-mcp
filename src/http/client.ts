import { DEFAULT_USER_AGENT } from "../config.js";
import { OlaolaHttpError } from "../errors.js";
import type { CookieJar } from "./cookie-jar.js";

export interface HttpClientOptions {
  cookieJar?: CookieJar;
  userAgent?: string;
}

export class HttpClient {
  private readonly cookieJar: CookieJar | undefined;
  private readonly userAgent: string;

  constructor(options: HttpClientOptions = {}) {
    this.cookieJar = options.cookieJar;
    this.userAgent = options.userAgent ?? DEFAULT_USER_AGENT;
  }

  async getText(url: string): Promise<string> {
    const response = await this.request(url, { method: "GET" });
    return response.text();
  }

  async postFormText(url: string, data: Record<string, string | number | boolean | null | undefined>): Promise<string> {
    const body = new URLSearchParams();
    for (const [key, value] of Object.entries(data)) {
      if (value === null || value === undefined) continue;
      body.set(key, String(value));
    }

    const response = await this.request(url, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body,
    });

    return response.text();
  }

  async postMultipartText(
    url: string,
    data: Record<string, string | number | boolean | null | undefined>,
  ): Promise<string> {
    const body = new FormData();
    for (const [key, value] of Object.entries(data)) {
      if (value === null || value === undefined) continue;
      body.set(key, String(value));
    }

    const response = await this.request(url, {
      method: "POST",
      body,
    });

    return response.text();
  }

  private async request(url: string, init: RequestInit): Promise<Response> {
    const headers = new Headers(init.headers);
    headers.set("user-agent", this.userAgent);
    headers.set("accept", headers.get("accept") ?? "text/html,application/json;q=0.9,*/*;q=0.8");

    const cookieHeader = this.cookieJar?.header;
    if (cookieHeader) headers.set("cookie", cookieHeader);

    const response = await fetch(url, { ...init, headers, redirect: "follow" });
    this.cookieJar?.store(response.headers.getSetCookie());

    if (!response.ok) {
      throw new OlaolaHttpError(`HTTP ${response.status} while fetching ${url}`, response.status, url);
    }

    return response;
  }
}
