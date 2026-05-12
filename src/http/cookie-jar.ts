export class CookieJar {
  private readonly cookies = new Map<string, string>();

  get header(): string | undefined {
    const value = [...this.cookies.entries()].map(([key, val]) => `${key}=${val}`).join("; ");
    return value || undefined;
  }

  store(setCookieHeaders: string[]): void {
    for (const header of setCookieHeaders) {
      const pair = header.split(";", 1)[0];
      if (!pair) continue;

      const separatorIndex = pair.indexOf("=");
      if (separatorIndex <= 0) continue;

      const key = pair.slice(0, separatorIndex).trim();
      const value = pair.slice(separatorIndex + 1).trim();
      if (key && value) this.cookies.set(key, value);
    }
  }

  toJSON(): Record<string, string> {
    return Object.fromEntries(this.cookies);
  }
}
