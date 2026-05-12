import type { HttpClient } from "../../http/client.js";
import { fetchProductSitemapEntries, type ProductSitemapEntry } from "../product-sitemap.js";

type TextClient = Pick<HttpClient, "getText">;

export async function fetchSitemapProductUrls(input: {
  query: string;
  maxUrls: number;
  client: TextClient;
}): Promise<string[]> {
  const entries = await fetchProductSitemapEntries(input.client);
  return entries
    .map((entry) => ({
      entry,
      score: scoreSitemapEntry(input.query, entry),
    }))
    .filter((match) => match.score > 0)
    .sort((left, right) => right.score - left.score || left.entry.slug.localeCompare(right.entry.slug, "cs-CZ"))
    .slice(0, input.maxUrls)
    .map((match) => match.entry.url);
}

function scoreSitemapEntry(query: string, entry: ProductSitemapEntry): number {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return 0;

  const slugTokens = tokenize(entry.slug);
  const slugCompact = slugTokens.join("");
  let score = 0;

  for (const queryToken of queryTokens) {
    if (slugTokens.includes(queryToken)) {
      score += 10;
      continue;
    }

    if (slugCompact.includes(queryToken)) {
      score += 7;
      continue;
    }

    if (slugTokens.some((slugToken) => areSimilarTerms(queryToken, slugToken))) {
      score += 5;
    }
  }

  return score;
}

function tokenize(value: string): string[] {
  return normalize(value)
    .split(/[^a-z0-9]+/g)
    .filter((token) => token.length >= 3);
}

function normalize(value: string): string {
  return value
    .toLocaleLowerCase("cs-CZ")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function areSimilarTerms(left: string, right: string): boolean {
  if (left.length < 5 || right.length < 5) return false;
  const similarity = 1 - editDistance(left, right) / Math.max(left.length, right.length);
  return similarity >= 0.72;
}

function editDistance(left: string, right: string): number {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  const current = Array.from({ length: right.length + 1 }, () => 0);

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    current[0] = leftIndex;

    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const substitutionCost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
      current[rightIndex] = Math.min(
        (previous[rightIndex] ?? Number.POSITIVE_INFINITY) + 1,
        (current[rightIndex - 1] ?? Number.POSITIVE_INFINITY) + 1,
        (previous[rightIndex - 1] ?? Number.POSITIVE_INFINITY) + substitutionCost,
      );
    }

    previous.splice(0, previous.length, ...current);
  }

  return previous[right.length] ?? 0;
}
