import { elementsByTag, parseHtml, textContent } from "../../utils/dom.js";
import { extractFunctionCallArgument } from "../../utils/script.js";
import type { DataLayerProduct } from "./types.js";

export function extractProductDataLayer(html: string): DataLayerProduct | null {
  const payload = extractProductPageDataLayerPayload(html);
  if (!payload) return null;

  try {
    const parsed = JSON.parse(payload) as { product?: DataLayerProduct };
    return parsed.product ?? null;
  } catch {
    return null;
  }
}

function extractProductPageDataLayerPayload(html: string): string | null {
  for (const script of elementsByTag(parseHtml(html), "script")) {
    const payload = extractFunctionCallArgument(textContent(script), "datalayer_push");
    if (payload?.includes('"type":"product"')) return payload;
  }

  return null;
}
