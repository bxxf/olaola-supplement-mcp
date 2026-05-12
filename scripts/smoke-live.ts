import { readAccountCart } from "../src/olaola/account/cart.js";
import { fetchOrderHistory } from "../src/olaola/account/orders.js";
import { OlaolaAccountService } from "../src/olaola/auth/session.js";
import { fetchProductDetails } from "../src/olaola/product-details.js";
import { retrieveProductsForModel } from "../src/olaola/product-retrieval.js";
import { OlaolaCartService } from "../src/olaola/shadow-cart.js";

async function main(): Promise<void> {
  await smokeProductRetrieval();
  await smokeProductDetails();
  await smokeShadowCart();
  await smokeAccountToolsWhenConfigured();
}

async function smokeProductRetrieval(): Promise<void> {
  const packets = await retrieveProductsForModel({
    queries: ["ashwagandha"],
    maxPerQuery: 2,
    maxContentHintsPerQuery: 2,
  });

  assert(packets.length === 1, "Expected one retrieval packet.");
  assert((packets[0]?.candidates.length ?? 0) > 0, "Expected at least one product candidate.");
  assert((packets[0]?.contentHints.length ?? 0) > 0, "Expected at least one WP product-content hint.");
  logOk("product retrieval");
}

async function smokeProductDetails(): Promise<void> {
  const product = await fetchProductDetails("oladen-napoj-pro-energii-a-imunitu-30-ks");
  assert(Boolean(product.ingredientsText), "Expected OlaDen ingredients text.");
  assert(Boolean(product.usageText), "Expected OlaDen usage text.");
  logOk("product details");
}

async function smokeShadowCart(): Promise<void> {
  const service = new OlaolaCartService();
  const cart = await service.createShadowCart();
  const snapshot = await service.addToShadowCart({
    cartId: cart.id,
    productUrlOrSlug: "ashwagandha-60-zele-bonbonu",
    quantity: 1,
  });

  assert(snapshot.itemCount >= 1, "Expected shadow cart to contain an item.");
  logOk("shadow cart");
}

async function smokeAccountToolsWhenConfigured(): Promise<void> {
  const accountService = new OlaolaAccountService();
  const status = await accountService.status();

  if (!status.configured) {
    logSkip("account tools", "OLAOLA_EMAIL and OLAOLA_PASSWORD are not configured.");
    return;
  }

  assert(status.authenticated, status.message);
  const session = await accountService.createSession();
  const orders = await fetchOrderHistory(session.client);
  assert(Array.isArray(orders), "Expected order history array.");

  const cart = await readAccountCart(session.client);
  assert(Array.isArray(cart.items), "Expected account cart items array.");
  logOk("account tools");
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function logOk(name: string): void {
  console.log(`ok ${name}`);
}

function logSkip(name: string, reason: string): void {
  console.log(`skip ${name}: ${reason}`);
}

await main();
