import type { ProductFacts } from "../domain/product.js";
import { HttpClient } from "../http/client.js";
import { toProductUrl } from "../utils/url.js";
import { extractProductDataLayer } from "./product/data-layer.js";
import { extractProductPageFallbacks } from "./product/html-fallbacks.js";
import { extractJsonLdProduct } from "./product/json-ld.js";
import { mapProductPageSourcesToFacts } from "./product/mapper.js";

export async function fetchProductFacts(urlOrSlug: string, client = new HttpClient()): Promise<ProductFacts> {
  const url = toProductUrl(urlOrSlug);
  const html = await client.getText(url);
  return parseProductFacts(html, url);
}

export function parseProductFacts(html: string, url: string): ProductFacts {
  return mapProductPageSourcesToFacts({
    url,
    sources: {
      jsonLdProduct: extractJsonLdProduct(html),
      dataLayerProduct: extractProductDataLayer(html),
      fallbacks: extractProductPageFallbacks(html),
    },
  });
}
