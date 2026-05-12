import { OLAOLA_BASE_URL } from "../config.js";
import { OlaolaParseError } from "../errors.js";
import { HttpClient } from "../http/client.js";
import { htmlToText, normalizeWhitespace } from "../utils/text.js";

const PRODUCT_CONTENT_ENDPOINT = `${OLAOLA_BASE_URL}/wp-json/wp/v2/product_content`;
const PRODUCT_CONTENT_FIELDS = "id,slug,link,title,content";

type TextClient = Pick<HttpClient, "getText">;

export interface ProductContentHint {
  position: number;
  wpId: number;
  slug: string;
  url: string;
  title: string | null;
  snippet: string;
}

interface WpProductContentEntry {
  id?: number;
  slug?: string;
  link?: string;
  title?: {
    rendered?: string;
  };
  content?: {
    rendered?: string;
  };
}

export async function fetchProductContentHints(input: {
  query: string;
  maxHints: number;
  client?: TextClient;
}): Promise<ProductContentHint[]> {
  const client = input.client ?? new HttpClient();
  const url = new URL(PRODUCT_CONTENT_ENDPOINT);
  url.searchParams.set("search", input.query);
  url.searchParams.set("per_page", String(input.maxHints));
  url.searchParams.set("_fields", PRODUCT_CONTENT_FIELDS);

  const entries = parseWpProductContentEntries(await client.getText(url.toString()));
  return entries.map(toProductContentHint).filter((hint): hint is ProductContentHint => Boolean(hint));
}

function parseWpProductContentEntries(responseText: string): WpProductContentEntry[] {
  try {
    const parsed = JSON.parse(responseText) as unknown;
    if (Array.isArray(parsed)) return parsed as WpProductContentEntry[];
    throw new OlaolaParseError("OlaOla WP product_content response was not an array.");
  } catch (error) {
    if (error instanceof OlaolaParseError) throw error;
    throw new OlaolaParseError("OlaOla WP product_content response was not valid JSON.", { cause: error });
  }
}

function toProductContentHint(entry: WpProductContentEntry, index: number): ProductContentHint | null {
  if (!entry.id || !entry.slug || !entry.link) return null;

  const snippet = toSnippet(entry.content?.rendered ?? "");
  if (!snippet) return null;

  return {
    position: index + 1,
    wpId: entry.id,
    slug: entry.slug,
    url: entry.link,
    title: normalizeNullable(entry.title?.rendered),
    snippet,
  };
}

function toSnippet(html: string): string {
  const text = normalizeWhitespace(htmlToText(html));
  if (text.length <= 1_200) return text;
  return `${text.slice(0, 1_197).trimEnd()}...`;
}

function normalizeNullable(value: string | undefined | null): string | null {
  if (!value) return null;
  const normalized = normalizeWhitespace(htmlToText(value));
  return normalized || null;
}
