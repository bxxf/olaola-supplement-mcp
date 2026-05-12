import { OlaolaParseError, OlaolaToolInputError } from "../errors.js";
import { buildQuickBuyUrl } from "../utils/url.js";
import { fetchProductFacts } from "./product-parser.js";

export async function generateQuickBuyUrl(input: {
  variantIds?: number[] | undefined;
  productUrlsOrSlugs?: string[] | undefined;
}): Promise<{ url: string; variantIds: number[] }> {
  const variantIds = [...(input.variantIds ?? [])];

  for (const productUrlOrSlug of input.productUrlsOrSlugs ?? []) {
    const product = await fetchProductFacts(productUrlOrSlug);
    if (!product.variant?.id) {
      throw new OlaolaParseError(`Product does not expose a variant ID: ${productUrlOrSlug}`);
    }

    variantIds.push(product.variant.id);
  }

  if (variantIds.length === 0) {
    throw new OlaolaToolInputError("At least one variant ID or product URL is required");
  }

  return {
    url: buildQuickBuyUrl(variantIds),
    variantIds: [...new Set(variantIds)],
  };
}
