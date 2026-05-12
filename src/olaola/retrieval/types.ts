import type { ProductContentHint } from "../wp-product-content.js";

export interface ProductCandidatePacket {
  query: string;
  source: "olaola_search";
  retrievalSources: Array<"storefront_search" | "product_sitemap" | "wp_product_content">;
  candidates: ProductCandidate[];
  contentHints: ProductContentHint[];
}

export interface ProductCandidate {
  position: number;
  matchedBy: Array<"storefront_search" | "product_sitemap">;
  name: string;
  url: string;
  priceCzk: number | null;
  variantId: number | null;
  sku: string | null;
  category: string | null;
  goal: string | null;
  size: string | null;
  description: string | null;
  benefits: string[];
}
