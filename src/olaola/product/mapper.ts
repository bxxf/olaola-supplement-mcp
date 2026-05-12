import type { ProductFacts } from "../../domain/product.js";
import { normalizeWhitespace, parseCzkPrice } from "../../utils/text.js";
import { productSlugFromUrl } from "../../utils/url.js";
import type { ProductPageSources } from "./types.js";

export function mapProductPageSourcesToFacts(input: { url: string; sources: ProductPageSources }): ProductFacts {
  const { url, sources } = input;
  const { jsonLdProduct, dataLayerProduct, fallbacks } = sources;
  const slug = productSlugFromUrl(url);
  const name = jsonLdProduct?.name ?? fallbacks.title ?? dataLayerProduct?.nameWeb?.[0] ?? slug;
  const priceFromJsonLd = parseCzkPrice(String(jsonLdProduct?.offers?.price ?? ""));
  const priceFromDataLayer = dataLayerProduct?.priceVat?.[0] ?? null;

  return {
    url,
    slug,
    name: normalizeWhitespace(name),
    description: normalizeNullable(jsonLdProduct?.description ?? fallbacks.metaDescription),
    sku: normalizeNullable(jsonLdProduct?.sku ?? dataLayerProduct?.id?.[0]),
    brand: normalizeNullable(dataLayerProduct?.brand?.[0] ?? "OlaOla"),
    category: normalizeNullable(jsonLdProduct?.category ?? dataLayerProduct?.category?.[0]),
    goal: normalizeNullable(dataLayerProduct?.goal?.[0]),
    size: normalizeNullable(dataLayerProduct?.size?.[0]),
    availability: normalizeNullable(jsonLdProduct?.offers?.availability),
    price: {
      amountCzk: priceFromJsonLd ?? priceFromDataLayer,
      currency: "CZK",
    },
    images: (jsonLdProduct?.image ?? []).map((imageUrl) => ({ url: imageUrl })),
    variant: fallbacks.variantId
      ? {
          id: fallbacks.variantId,
          sku: normalizeNullable(dataLayerProduct?.variant?.[0] ?? jsonLdProduct?.sku),
          name: normalizeNullable(dataLayerProduct?.nameVariant?.[0] ?? dataLayerProduct?.name?.[0]),
          size: normalizeNullable(dataLayerProduct?.size?.[0]),
        }
      : null,
    ingredientsText: null,
    usageText: null,
    parametersText: null,
    benefits: fallbacks.benefits,
    source: {
      jsonLd: Boolean(jsonLdProduct),
      dataLayer: Boolean(dataLayerProduct),
      dom: hasDomFallbacks(fallbacks),
    },
  };
}

function hasDomFallbacks(fallbacks: ProductPageSources["fallbacks"]): boolean {
  return Boolean(fallbacks.title || fallbacks.metaDescription || fallbacks.variantId || fallbacks.benefits.length > 0);
}

function normalizeNullable(value: string | undefined | null): string | null {
  if (!value) return null;
  const normalized = normalizeWhitespace(value);
  return normalized || null;
}
