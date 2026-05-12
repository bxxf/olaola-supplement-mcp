import { attr, elementsByClass, elementsByTag, firstElementByTag, parseHtml, textContent } from "../../utils/dom.js";
import { parseInteger } from "../../utils/text.js";
import type { ProductPageFallbacks } from "./types.js";

export function extractProductPageFallbacks(html: string): ProductPageFallbacks {
  const nodes = parseHtml(html);

  return {
    title: extractTitle(nodes),
    metaDescription: extractMetaDescription(nodes),
    variantId: extractVariantId(nodes),
    benefits: extractBenefits(nodes),
  };
}

function extractVariantId(nodes: ReturnType<typeof parseHtml>): number | null {
  const input = elementsByTag(nodes, "input").find((element) => attr(element, "name") === "product_variant_id");
  return parseInteger(attr(input, "value"));
}

function extractTitle(nodes: ReturnType<typeof parseHtml>): string | null {
  return textContent(firstElementByTag(nodes, "h1")) || null;
}

function extractMetaDescription(nodes: ReturnType<typeof parseHtml>): string | null {
  const description = elementsByTag(nodes, "meta").find((element) => attr(element, "name") === "description");
  return attr(description, "content");
}

function extractBenefits(nodes: ReturnType<typeof parseHtml>): string[] {
  const lists = elementsByClass(nodes, "product-detail-header__benefits");
  const values = lists.flatMap((list) =>
    elementsByTag([list], "li")
      .map((item) => textContent(item))
      .filter(Boolean),
  );

  return [...new Set(values)];
}
