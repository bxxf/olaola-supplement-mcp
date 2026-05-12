import { OLAOLA_BASE_URL } from "../config.js";

export function toProductUrl(urlOrSlug: string): string {
  if (urlOrSlug.startsWith("http://") || urlOrSlug.startsWith("https://")) {
    return urlOrSlug;
  }

  const slug = urlOrSlug
    .replace(/^\/+/, "")
    .replace(/^produkt\//, "")
    .replace(/\/+$/, "");

  return `${OLAOLA_BASE_URL}/produkt/${slug}/`;
}

export function productSlugFromUrl(url: string): string {
  const parsed = new URL(url);
  const parts = parsed.pathname.split("/").filter(Boolean);
  const productIndex = parts.indexOf("produkt");
  const productSlug = productIndex >= 0 ? parts[productIndex + 1] : undefined;
  return productSlug ?? parts.at(-1) ?? "";
}

export function buildQuickBuyUrl(variantIds: number[]): string {
  const ids = [...new Set(variantIds)].join(",");
  return `${OLAOLA_BASE_URL}/?quick-buy=${encodeURIComponent(ids)}`;
}
