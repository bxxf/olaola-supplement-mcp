import { HttpClient } from "../http/client.js";
import { attr, elementsByClass, parseHtml } from "../utils/dom.js";

export async function fetchSearchResultProductUrls(input: { query: string; client?: HttpClient }): Promise<string[]> {
  const client = input.client ?? new HttpClient();
  const searchUrl = new URL("https://www.olaola.cz/vyhledavani/");
  searchUrl.searchParams.set("search", input.query);

  const html = await client.getText(searchUrl.toString());
  return unique(
    elementsByClass(parseHtml(html), "product-card__link")
      .map((link) => attr(link, "href"))
      .filter((url): url is string => Boolean(url?.startsWith("https://www.olaola.cz/produkt/"))),
  );
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}
