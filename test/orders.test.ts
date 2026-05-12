import { describe, expect, it } from "vitest";
import { parseOrderHistory } from "../src/olaola/account/orders.js";
import { readFixture } from "./fixtures.js";

describe("parseOrderHistory", () => {
  it("parses account order cards from authenticated account HTML", async () => {
    const ordersHtml = await readFixture("order-history.html");

    expect(parseOrderHistory(ordersHtml)).toEqual([
      {
        orderNumber: "16129",
        detailUrl: "https://www.olaola.cz/muj-ucet/objednavka?order_number=16129",
        status: "Odesláno",
        orderedAt: "2026-05-11T20:45:19+02:00",
        paymentStatus: "Zaplaceno",
        totalPriceCzk: 2768,
        productUrls: [
          "https://www.olaola.cz/produkt/omega-3-90-kapsli/",
          "https://www.olaola.cz/produkt/vitaminy-d3-k2-30-ml-kapky/",
        ],
      },
    ]);
  });
});
