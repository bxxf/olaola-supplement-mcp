import { attr, elementsByTag, parseHtml, textContent } from "../../utils/dom.js";
import type { JsonLdProduct } from "./types.js";

export function extractJsonLdProduct(html: string): JsonLdProduct | null {
  for (const raw of extractJsonLdScripts(html)) {
    const graph = parseJsonLdGraph(raw);
    const product = graph.find(isJsonLdProduct);
    if (product) return product;
  }

  return null;
}

function extractJsonLdScripts(html: string): string[] {
  return elementsByTag(parseHtml(html), "script")
    .filter((script) => attr(script, "type") === "application/ld+json")
    .map((script) => textContent(script))
    .filter((value): value is string => Boolean(value));
}

function parseJsonLdGraph(raw: string): unknown[] {
  try {
    const parsed = JSON.parse(raw) as { "@graph"?: unknown[] } | unknown[];
    if (Array.isArray(parsed)) return parsed;
    return Array.isArray(parsed["@graph"]) ? parsed["@graph"] : [];
  } catch {
    return [];
  }
}

function isJsonLdProduct(value: unknown): value is JsonLdProduct {
  if (!value || typeof value !== "object") return false;
  return (value as JsonLdProduct)["@type"] === "Product";
}
