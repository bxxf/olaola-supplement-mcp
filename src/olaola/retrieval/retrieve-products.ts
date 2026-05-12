import { HttpClient } from "../../http/client.js";
import { fetchSearchResultProductUrls } from "../search-results.js";
import { hydrateProductCandidates, type ProductCandidateUrl } from "./candidates.js";
import { fetchSupplementalContentHints } from "./content-hints.js";
import { normalizeRetrievalQueries } from "./query.js";
import { fetchSitemapProductUrls } from "./sitemap-candidates.js";
import type { ProductCandidatePacket } from "./types.js";

export async function retrieveProductsForModel(input: {
  queries: string[];
  maxPerQuery?: number | undefined;
  maxContentHintsPerQuery?: number | undefined;
  includeContentHints?: boolean | undefined;
}): Promise<ProductCandidatePacket[]> {
  const maxPerQuery = input.maxPerQuery ?? 8;
  const maxContentHintsPerQuery = input.maxContentHintsPerQuery ?? 0;
  const client = new HttpClient();
  const packets: ProductCandidatePacket[] = [];

  for (const query of normalizeRetrievalQueries(input.queries)) {
    const [storefrontUrls, sitemapUrls] = await Promise.all([
      fetchSearchResultProductUrls({ query, client }),
      fetchSitemapProductUrls({ query, maxUrls: maxPerQuery * 2, client }),
    ]);

    const candidateUrls = mergeCandidateUrls({ storefrontUrls, sitemapUrls });
    const includeContentHints = input.includeContentHints === true && maxContentHintsPerQuery > 0;

    packets.push({
      query,
      source: "olaola_search",
      retrievalSources: [
        ...(storefrontUrls.length > 0 ? (["storefront_search"] as const) : []),
        ...(sitemapUrls.length > 0 ? (["product_sitemap"] as const) : []),
        ...(includeContentHints ? (["wp_product_content"] as const) : []),
      ],
      candidates: await hydrateProductCandidates({ urls: candidateUrls, maxPerQuery, client }),
      contentHints: includeContentHints
        ? await fetchSupplementalContentHints({ query, maxContentHintsPerQuery, client })
        : [],
    });
  }

  return packets;
}

function mergeCandidateUrls(input: { storefrontUrls: string[]; sitemapUrls: string[] }): ProductCandidateUrl[] {
  const merged = new Map<string, ProductCandidateUrl>();

  for (const url of input.storefrontUrls) {
    merged.set(url, {
      url,
      matchedBy: ["storefront_search"],
    });
  }

  for (const url of input.sitemapUrls) {
    const existing = merged.get(url);
    if (existing) {
      if (!existing.matchedBy.includes("product_sitemap")) existing.matchedBy.push("product_sitemap");
      continue;
    }

    merged.set(url, {
      url,
      matchedBy: ["product_sitemap"],
    });
  }

  return [...merged.values()];
}
