import { htmlToPlainText } from "./dom.js";

export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function parseCzkPrice(value: string | undefined | null): number | null {
  if (!value) return null;

  const normalized = value
    .replace(/\u00a0/g, " ")
    .replace(/[^\d,.-]/g, "")
    .replace(/\s+/g, "")
    .replace(",", ".");

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? Math.round(parsed) : null;
}

export function parseInteger(value: string | undefined | null): number | null {
  if (!value) return null;

  let digits = "";
  for (const char of value) {
    if (char >= "0" && char <= "9") {
      digits += char;
      continue;
    }

    if (digits) break;
  }

  if (!digits) return null;

  const parsed = Number.parseInt(digits, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function stripHtml(value: string): string {
  return normalizeWhitespace(htmlToText(value));
}

export function htmlToText(value: string): string {
  return htmlToPlainText(value);
}
