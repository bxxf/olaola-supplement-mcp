import { OlaolaParseError } from "../../errors.js";
import type { HttpClient } from "../../http/client.js";
import { attr, elementsByTag, parseHtml } from "../../utils/dom.js";
import { extractQuotedObjectProperty } from "../../utils/script.js";
import { htmlToText } from "../../utils/text.js";

export type ProductModalId = "product-specification" | "product-instructions" | "product-parameters";

const MODAL_ENDPOINT = "https://www.olaola.cz/wp-admin/admin-ajax.php?lang=cs&action=modal";

interface ModalAjaxResponse {
  success?: boolean;
  data?: {
    fragments?: {
      append?: {
        body?: string;
      };
    };
  };
}

export function extractAjaxNonce(html: string): string | null {
  for (const script of elementsByTag(parseHtml(html), "script")) {
    const nonce = extractQuotedObjectProperty(scriptText(script), "ajax_nonce");
    if (nonce) return nonce;
  }

  return null;
}

export function extractProductModalContext(html: string, id: ProductModalId): string | null {
  for (const button of elementsByTag(parseHtml(html), "button")) {
    if (attr(button, "data-open-modal") !== id) continue;

    return attr(button, "data-modal-context");
  }

  return null;
}

export async function fetchProductModalText(input: {
  id: ProductModalId;
  context: string | number;
  ajaxNonce: string | null;
  client: HttpClient;
}): Promise<string | null> {
  const response = await input.client.postFormText(MODAL_ENDPOINT, {
    id: input.id,
    context: input.context,
    _ajax_nonce: input.ajaxNonce,
  });

  return parseProductModalText(response);
}

export function parseProductModalText(rawResponse: string): string | null {
  const body = parseModalBody(rawResponse);
  if (!body) return null;

  const text = htmlToText(body);
  return text || null;
}

function parseModalBody(rawResponse: string): string | null {
  const parsed = parseModalResponse(rawResponse);
  if (parsed.success === false) return null;

  return parsed.data?.fragments?.append?.body ?? null;
}

function parseModalResponse(rawResponse: string): ModalAjaxResponse {
  try {
    return JSON.parse(rawResponse) as ModalAjaxResponse;
  } catch (error) {
    throw new OlaolaParseError("OlaOla product modal response was not valid JSON.", { cause: error });
  }
}

function scriptText(script: ReturnType<typeof elementsByTag>[number]): string {
  return script.children.map((child) => ("data" in child ? String(child.data) : "")).join("");
}
