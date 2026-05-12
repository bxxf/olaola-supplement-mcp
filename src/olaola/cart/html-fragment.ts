import type { AnyNode, Element } from "domhandler";
import type { CartItem, CartSnapshot } from "../../domain/cart.js";
import {
  attr,
  elementsByClass,
  elementsByTag,
  firstElementByClass,
  hasCheckedInput,
  parseHtml,
  textContent,
} from "../../utils/dom.js";
import { parseCzkPrice, parseInteger } from "../../utils/text.js";

interface CartUpdatePayload {
  cart_item_id?: number;
  quantity?: number;
  subscription_plan_id?: number;
}

export function parseSidebarCartFragment(html: string, source: CartSnapshot["source"]): CartSnapshot {
  const nodes = parseHtml(html);
  const items = elementsByClass(nodes, "sidebar-cart-item").map(parseSidebarCartItem);
  const subtotalCzk = parseCzkPrice(textContent(firstElementByClass(nodes, "sidebar-cart-footer__summary-price")));

  return {
    source,
    authenticated: source === "user_cart",
    items,
    subtotalCzk,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

function parseSidebarCartItem(item: Element): CartItem {
  const nodes = [item];
  const quantity = parseInteger(textContent(firstElementByClass(nodes, "sidebar-cart-item__quantity"))) ?? 1;
  const linePrice = parseCzkPrice(textContent(firstElementByClass(nodes, "sidebar-cart-item__price")));

  return {
    cartItemId: extractCartItemId(nodes),
    name: textContent(firstElementByClass(nodes, "sidebar-cart-item__headline")) || "Unknown item",
    url: extractProductUrl(nodes),
    sku: null,
    variantId: null,
    quantity,
    unitPriceCzk: quantity > 1 && linePrice ? Math.round(linePrice / quantity) : linePrice,
    linePriceCzk: linePrice,
    subscription: hasCheckedInput(nodes, "subscription"),
  };
}

function extractProductUrl(nodes: AnyNode[]): string | null {
  return (
    elementsByTag(nodes, "a")
      .map((anchor) => attr(anchor, "href"))
      .find((href) => href?.startsWith("https://www.olaola.cz/produkt/")) ?? null
  );
}

function extractCartItemId(nodes: AnyNode[]): number | null {
  for (const element of elementsWithCartUpdatePayload(nodes)) {
    const payload = parseCartUpdatePayload(attr(element, "data-cart-update-item"));
    if (payload?.cart_item_id) return payload.cart_item_id;
  }

  return null;
}

function elementsWithCartUpdatePayload(nodes: AnyNode[]): Element[] {
  return elementsByTag(nodes, "button")
    .concat(elementsByTag(nodes, "label"))
    .filter((element) => attr(element, "data-cart-update-item") !== null);
}

function parseCartUpdatePayload(value: string | null): CartUpdatePayload | null {
  if (!value) return null;

  try {
    return JSON.parse(value) as CartUpdatePayload;
  } catch {
    return null;
  }
}
