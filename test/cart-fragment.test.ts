import { describe, expect, it } from "vitest";
import { parseSidebarCartFragment } from "../src/olaola/cart/html-fragment.js";
import { readFixture } from "./fixtures.js";

describe("parseSidebarCartFragment", () => {
  it("parses normalized cart items from sidebar cart HTML", async () => {
    const cartHtml = await readFixture("sidebar-cart.html");
    const cart = parseSidebarCartFragment(cartHtml, "shadow_cart");

    expect(cart).toEqual({
      source: "shadow_cart",
      authenticated: false,
      subtotalCzk: 898,
      itemCount: 2,
      items: [
        {
          cartItemId: 12345,
          name: "Želé Ashwagandha podporující zdravý životní styl",
          url: "https://www.olaola.cz/produkt/ashwagandha-60-zele-bonbonu/",
          sku: null,
          variantId: null,
          quantity: 2,
          unitPriceCzk: 449,
          linePriceCzk: 898,
          subscription: true,
        },
      ],
    });
  });
});
