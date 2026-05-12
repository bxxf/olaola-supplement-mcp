import { OLAOLA_AJAX_URL } from "../config.js";
import { type CartSnapshot, emptyShadowCartSnapshot } from "../domain/cart.js";
import { OlaolaNotFoundError, OlaolaParseError, OlaolaToolInputError } from "../errors.js";
import { HttpClient } from "../http/client.js";
import { CookieJar } from "../http/cookie-jar.js";
import { extractSidebarCartFragment } from "./cart/ajax-response.js";
import { parseSidebarCartFragment } from "./cart/html-fragment.js";
import { extractAjaxNonce } from "./product/modal.js";
import { fetchProductFacts } from "./product-parser.js";

export interface ShadowCart {
  id: string;
  cookieJar: CookieJar;
  nonce: string;
  createdAt: Date;
  lastSnapshot: CartSnapshot;
}

export interface AddToShadowCartInput {
  cartId: string;
  productUrlOrSlug?: string | undefined;
  variantId?: number | undefined;
  quantity?: number | undefined;
}

export interface UpdateShadowCartItemInput {
  cartId: string;
  cartItemId: number;
  quantity: number;
}

export class ShadowCartStore {
  private readonly carts = new Map<string, ShadowCart>();

  create(cart: Omit<ShadowCart, "id" | "createdAt">): ShadowCart {
    const shadowCart: ShadowCart = {
      ...cart,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    this.carts.set(shadowCart.id, shadowCart);
    return shadowCart;
  }

  get(id: string): ShadowCart {
    const cart = this.carts.get(id);
    if (!cart) throw new OlaolaNotFoundError(`Shadow cart not found: ${id}`);
    return cart;
  }

  updateSnapshot(id: string, snapshot: CartSnapshot): void {
    this.get(id).lastSnapshot = snapshot;
  }
}

export class OlaolaCartService {
  constructor(private readonly store = new ShadowCartStore()) {}

  async createShadowCart(seedUrl = "https://www.olaola.cz/"): Promise<ShadowCart> {
    const cookieJar = new CookieJar();
    const client = new HttpClient({ cookieJar });
    const html = await client.getText(seedUrl);
    const nonce = extractAjaxNonce(html);

    if (!nonce) {
      throw new OlaolaParseError("Could not extract OlaOla AJAX nonce");
    }

    return this.store.create({
      cookieJar,
      nonce,
      lastSnapshot: emptyShadowCartSnapshot(),
    });
  }

  async addToShadowCart(input: AddToShadowCartInput): Promise<CartSnapshot> {
    const cart = this.store.get(input.cartId);
    const client = new HttpClient({ cookieJar: cart.cookieJar });
    const variantId = input.variantId ?? (await this.resolveVariantId(input.productUrlOrSlug, client));

    const responseText = await client.postFormText(`${OLAOLA_AJAX_URL}&action=cart_add_product_variant`, {
      product_variant_id: variantId,
      quantity: input.quantity ?? 1,
      _ajax_nonce: cart.nonce,
    });

    const snapshot = parseAjaxCartResponse(responseText);
    this.store.updateSnapshot(cart.id, snapshot);
    return snapshot;
  }

  async updateShadowCartItem(input: UpdateShadowCartItemInput): Promise<CartSnapshot> {
    const cart = this.store.get(input.cartId);
    const client = new HttpClient({ cookieJar: cart.cookieJar });

    const responseText = await client.postFormText(`${OLAOLA_AJAX_URL}&action=cart_update_item`, {
      cart_item_id: input.cartItemId,
      quantity: input.quantity,
      _ajax_nonce: cart.nonce,
    });

    const snapshot = parseAjaxCartResponse(responseText);
    this.store.updateSnapshot(cart.id, snapshot);
    return snapshot;
  }

  readShadowCart(input: { cartId: string }): CartSnapshot {
    return this.store.get(input.cartId).lastSnapshot;
  }

  private async resolveVariantId(productUrlOrSlug: string | undefined, client: HttpClient): Promise<number> {
    if (!productUrlOrSlug) {
      throw new OlaolaToolInputError("Either variantId or productUrlOrSlug is required");
    }

    const product = await fetchProductFacts(productUrlOrSlug, client);
    if (!product.variant?.id) {
      throw new OlaolaParseError(`Product does not expose a variant ID: ${productUrlOrSlug}`);
    }

    return product.variant.id;
  }
}

function parseAjaxCartResponse(responseText: string): CartSnapshot {
  return parseSidebarCartFragment(extractSidebarCartFragment(responseText), "shadow_cart");
}
