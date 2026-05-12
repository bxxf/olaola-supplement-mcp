import type { AnyNode, Element } from "domhandler";
import { OLAOLA_BASE_URL } from "../../config.js";
import type { OlaolaOrderDetail, OlaolaOrderSummary } from "../../domain/order.js";
import type { HttpClient } from "../../http/client.js";
import {
  attr,
  elementsByClass,
  elementsByTag,
  firstElementByClass,
  firstElementByTag,
  parseHtml,
  textContent,
} from "../../utils/dom.js";
import { parseCzkPrice } from "../../utils/text.js";

const ORDERS_URL = `${OLAOLA_BASE_URL}/muj-ucet/objednavky/`;

export async function fetchOrderHistory(client: HttpClient): Promise<OlaolaOrderSummary[]> {
  return parseOrderHistory(await client.getText(ORDERS_URL));
}

export async function fetchOrderDetail(input: { client: HttpClient; orderNumber: string }): Promise<OlaolaOrderDetail> {
  const detailUrl = `${OLAOLA_BASE_URL}/muj-ucet/objednavka?order_number=${encodeURIComponent(input.orderNumber)}`;
  const html = await input.client.getText(detailUrl);
  const summary = parseOrderHistory(html)[0] ?? {
    orderNumber: input.orderNumber,
    detailUrl,
    status: null,
    orderedAt: null,
    paymentStatus: null,
    totalPriceCzk: null,
    productUrls: extractProductUrlsFromHtml(html),
  };

  return {
    ...summary,
    detailUrl,
    text: extractMainAccountText(html),
  };
}

export function parseOrderHistory(html: string): OlaolaOrderSummary[] {
  return elementsByClass(parseHtml(html), "order-card")
    .map((element) => parseOrderCard(element))
    .filter((order): order is OlaolaOrderSummary => Boolean(order));
}

function parseOrderCard(element: Element): OlaolaOrderSummary | null {
  const orderNumber = textByClass(element, "order-card__id")?.replace(/^#/, "");
  if (!orderNumber) return null;

  return {
    orderNumber,
    detailUrl: normalizeUrl(findOrderDetailHref(element)),
    status: textByClass(element, "order-card__header-left"),
    orderedAt: firstAttributeByTag(element, "time", "datetime"),
    paymentStatus: extractColumnValue(element, "Stav platby"),
    totalPriceCzk: parseCzkPrice(extractColumnValue(element, "Cena")),
    productUrls: extractProductUrls(element),
  };
}

function extractColumnValue(element: Element, label: string): string | null {
  for (const column of elementsByClass([element], "order-card__col")) {
    if (textByClass(column, "order-card__title") !== label) continue;

    return textContent(column).replace(label, "").trim() || null;
  }

  return null;
}

function extractProductUrls(element: Element): string[] {
  return extractProductUrlsFromNodes([element]);
}

function extractProductUrlsFromHtml(html: string): string[] {
  return extractProductUrlsFromNodes(parseHtml(html));
}

function extractProductUrlsFromNodes(nodes: AnyNode[]): string[] {
  const urls = elementsByTag(nodes, "a")
    .map((anchor) => attr(anchor, "href"))
    .filter((href): href is string => Boolean(href?.startsWith(`${OLAOLA_BASE_URL}/produkt/`)));

  return [...new Set(urls)];
}

function extractMainAccountText(html: string): string {
  const nodes = parseHtml(html);
  return textContent(firstElementByClass(nodes, "my-account-template__main") ?? nodes);
}

function normalizeUrl(value: string | undefined): string | null {
  if (!value) return null;
  if (value.startsWith("http")) return value;
  return `${OLAOLA_BASE_URL}${value.startsWith("/") ? "" : "/"}${value}`;
}

function textByClass(element: Element, className: string): string | null {
  return textContent(firstElementByClass([element], className)) || null;
}

function findOrderDetailHref(element: Element): string | undefined {
  return elementsByTag([element], "a")
    .map((anchor) => attr(anchor, "href"))
    .find((href): href is string => Boolean(href?.includes("order_number=")));
}

function firstAttributeByTag(element: Element, tagName: string, attributeName: string): string | null {
  return attr(firstElementByTag([element], tagName), attributeName);
}
