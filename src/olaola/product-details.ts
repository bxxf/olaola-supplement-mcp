import type { ProductFacts } from "../domain/product.js";
import { HttpClient } from "../http/client.js";
import { CookieJar } from "../http/cookie-jar.js";
import { toProductUrl } from "../utils/url.js";
import { extractAjaxNonce, extractProductModalContext, fetchProductModalText } from "./product/modal.js";
import { parseProductFacts } from "./product-parser.js";

export async function fetchProductDetails(urlOrSlug: string, client = createDetailClient()): Promise<ProductFacts> {
  const url = toProductUrl(urlOrSlug);
  const html = await client.getText(url);
  const facts = parseProductFacts(html, url);

  if (!facts.variant) return facts;

  const ajaxNonce = extractAjaxNonce(html);
  const [ingredientsText, usageText, parametersText] = await Promise.all([
    fetchDetailModalText("product-specification", html, facts.variant.id, ajaxNonce, client),
    fetchDetailModalText("product-instructions", html, facts.variant.id, ajaxNonce, client),
    fetchDetailModalText("product-parameters", html, facts.variant.id, ajaxNonce, client),
  ]);

  return {
    ...facts,
    ingredientsText,
    usageText,
    parametersText,
  };
}

function createDetailClient(): HttpClient {
  return new HttpClient({ cookieJar: new CookieJar() });
}

function fetchDetailModalText(
  id: "product-specification" | "product-instructions" | "product-parameters",
  html: string,
  variantId: number,
  ajaxNonce: string | null,
  client: HttpClient,
): Promise<string | null> {
  return fetchProductModalText({
    id,
    context: extractProductModalContext(html, id) ?? variantId,
    ajaxNonce,
    client,
  });
}
