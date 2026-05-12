import { OLAOLA_BASE_URL } from "../config.js";
import { HttpClient } from "../http/client.js";
import { elementsByTag, parseHtml, textContent } from "../utils/dom.js";
import { productSlugFromUrl } from "../utils/url.js";

const PRODUCT_SITEMAP_URL = `${OLAOLA_BASE_URL}/product-sitemap.xml`;

type TextClient = Pick<HttpClient, "getText">;

export interface ProductSitemapEntry {
  url: string;
  slug: string;
}

export async function fetchProductSitemapEntries(
  client: TextClient = new HttpClient(),
): Promise<ProductSitemapEntry[]> {
  const xml = await client.getText(PRODUCT_SITEMAP_URL);
  const urls = elementsByTag(parseHtml(xml), "loc")
    .map((loc) => textContent(loc))
    .filter((url) => url.startsWith(`${OLAOLA_BASE_URL}/produkt/`));

  return [...new Set(urls)].map((url) => ({
    url,
    slug: productSlugFromUrl(url),
  }));
}
