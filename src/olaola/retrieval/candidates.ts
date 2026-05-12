import type { HttpClient } from "../../http/client.js";
import { fetchProductFacts } from "../product-parser.js";
import type { ProductCandidate } from "./types.js";

export interface ProductCandidateUrl {
  url: string;
  matchedBy: Array<"storefront_search" | "product_sitemap">;
}

export async function hydrateProductCandidates(input: {
  urls: ProductCandidateUrl[];
  maxPerQuery: number;
  client: HttpClient;
}): Promise<ProductCandidate[]> {
  const candidates: ProductCandidate[] = [];

  for (const [index, match] of input.urls.slice(0, input.maxPerQuery).entries()) {
    try {
      const product = await fetchProductFacts(match.url, input.client);
      candidates.push({
        position: index + 1,
        matchedBy: match.matchedBy,
        name: product.name,
        url: product.url,
        priceCzk: product.price.amountCzk,
        variantId: product.variant?.id ?? null,
        sku: product.sku,
        category: product.category,
        goal: product.goal,
        size: product.size,
        description: product.description,
        benefits: product.benefits,
      });
    } catch {
      // Retrieval is best-effort; stale search results should not fail an entire query packet.
    }
  }

  return candidates;
}
