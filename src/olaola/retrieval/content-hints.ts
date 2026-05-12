import type { HttpClient } from "../../http/client.js";
import { fetchProductContentHints, type ProductContentHint } from "../wp-product-content.js";

export async function fetchSupplementalContentHints(input: {
  query: string;
  maxContentHintsPerQuery: number;
  client: HttpClient;
}): Promise<ProductContentHint[]> {
  try {
    return await fetchProductContentHints({
      query: input.query,
      maxHints: input.maxContentHintsPerQuery,
      client: input.client,
    });
  } catch {
    // WP product_content is supplemental context; real product retrieval should stay usable if it changes.
    return [];
  }
}
