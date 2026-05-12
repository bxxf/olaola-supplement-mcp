import { type AnyNode, type Element, isTag } from "domhandler";
import { findAll, getAttributeValue, getText } from "domutils";
import { parseDocument } from "htmlparser2";

export function parseHtml(html: string): AnyNode[] {
  return parseDocument(html).children;
}

export function elementsByClass(nodes: AnyNode[], className: string): Element[] {
  return findAll((node): node is Element => isElement(node) && classList(node).includes(className), nodes);
}

export function firstElementByClass(nodes: AnyNode[], className: string): Element | null {
  return elementsByClass(nodes, className)[0] ?? null;
}

export function elementsByTag(nodes: AnyNode[], tagName: string): Element[] {
  return findAll((node): node is Element => isElement(node) && node.name === tagName, nodes);
}

export function firstElementByTag(nodes: AnyNode[], tagName: string): Element | null {
  return elementsByTag(nodes, tagName)[0] ?? null;
}

export function attr(element: Element | null | undefined, name: string): string | null {
  if (!element) return null;
  return getAttributeValue(element, name) ?? null;
}

export function textContent(node: AnyNode | AnyNode[] | null | undefined): string {
  if (!node) return "";
  return normalizeWhitespace(getText(Array.isArray(node) ? node : [node]));
}

export function htmlToPlainText(html: string): string {
  const chunks: string[] = [];
  writePlainText(parseHtml(html), chunks);
  return normalizeWhitespace(chunks.join(" "));
}

export function hasCheckedInput(nodes: AnyNode[], name: string): boolean {
  return elementsByTag(nodes, "input").some((input) => attr(input, "name") === name && attr(input, "checked") !== null);
}

function classList(element: Element): string[] {
  return (attr(element, "class") ?? "").split(/\s+/).filter(Boolean);
}

function isElement(node: AnyNode): node is Element {
  return isTag(node);
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function writePlainText(nodes: AnyNode[], chunks: string[]): void {
  for (const node of nodes) {
    if (isElement(node)) {
      if (["script", "style", "svg"].includes(node.name)) continue;
      writePlainText(node.children, chunks);
      continue;
    }

    const text = getText([node]);
    if (text) chunks.push(text);
  }
}
