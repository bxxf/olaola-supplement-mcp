import { OLAOLA_AJAX_URL, OLAOLA_BASE_URL } from "../../config.js";
import type { CartSnapshot } from "../../domain/cart.js";
import { OlaolaParseError, OlaolaToolInputError } from "../../errors.js";
import type { HttpClient } from "../../http/client.js";
import { extractSidebarCartFragment } from "../cart/ajax-response.js";
import { parseSidebarCartFragment } from "../cart/html-fragment.js";
import { extractAjaxNonce } from "../product/modal.js";
import { fetchProductFacts } from "../product-parser.js";

export interface AddToAccountCartInput {
  client: HttpClient;
  productUrlOrSlug?: string | undefined;
  variantId?: number | undefined;
  quantity?: number | undefined;
}

export interface UpdateAccountCartItemInput {
  client: HttpClient;
  cartItemId: number;
  quantity: number;
}

export async function readAccountCart(client: HttpClient): Promise<CartSnapshot> {
  const html = await client.getText(OLAOLA_BASE_URL);
  const nonce = extractAjaxNonce(html);

  if (!nonce) {
    throw new OlaolaParseError("Could not extract OlaOla AJAX nonce for account cart.");
  }

  const responseText = await client.postFormText(`${OLAOLA_AJAX_URL}&action=modal`, {
    id: "cart",
    context: "",
    _ajax_nonce: nonce,
  });

  return parseAccountCartResponse(responseText);
}

export async function addToAccountCart(input: AddToAccountCartInput): Promise<CartSnapshot> {
  const html = await input.client.getText(OLAOLA_BASE_URL);
  const nonce = extractAjaxNonce(html);

  if (!nonce) {
    throw new OlaolaParseError("Could not extract OlaOla AJAX nonce for account cart.");
  }

  const variantId = input.variantId ?? (await resolveVariantId(input.client, input.productUrlOrSlug));
  const responseText = await input.client.postFormText(`${OLAOLA_AJAX_URL}&action=cart_add_product_variant`, {
    product_variant_id: variantId,
    quantity: input.quantity ?? 1,
    _ajax_nonce: nonce,
  });

  return parseAccountCartResponse(responseText);
}

export async function updateAccountCartItem(input: UpdateAccountCartItemInput): Promise<CartSnapshot> {
  const html = await input.client.getText(OLAOLA_BASE_URL);
  const nonce = extractAjaxNonce(html);

  if (!nonce) {
    throw new OlaolaParseError("Could not extract OlaOla AJAX nonce for account cart.");
  }

  const responseText = await input.client.postFormText(`${OLAOLA_AJAX_URL}&action=cart_update_item`, {
    cart_item_id: input.cartItemId,
    quantity: input.quantity,
    _ajax_nonce: nonce,
  });

  return parseAccountCartResponse(responseText);
}

async function resolveVariantId(client: HttpClient, productUrlOrSlug: string | undefined): Promise<number> {
  if (!productUrlOrSlug) {
    throw new OlaolaToolInputError("Either variantId or productUrlOrSlug is required.");
  }

  const product = await fetchProductFacts(productUrlOrSlug, client);
  if (!product.variant?.id) {
    throw new OlaolaParseError(`Product does not expose a variant ID: ${productUrlOrSlug}`);
  }

  return product.variant.id;
}

function parseAccountCartResponse(responseText: string): CartSnapshot {
  return parseSidebarCartFragment(extractSidebarCartFragment(responseText), "user_cart");
}
