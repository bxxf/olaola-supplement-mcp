import { describe, expect, it } from "vitest";
import { parseProductFacts } from "../src/olaola/product-parser.js";
import { readFixture } from "./fixtures.js";

describe("parseProductFacts", () => {
  it("combines JSON-LD, dataLayer, and DOM fallbacks into normalized product facts", async () => {
    const productHtml = await readFixture("product-page.html");
    const product = parseProductFacts(productHtml, "https://www.olaola.cz/produkt/test-produkt/");

    expect(product).toMatchObject({
      url: "https://www.olaola.cz/produkt/test-produkt/",
      slug: "test-produkt",
      name: "Test produkt",
      description: "Popis produktu",
      sku: "SKU-1",
      brand: "OlaOla",
      category: "Doplňky stravy",
      goal: "Energie",
      size: "90 kapslí",
      price: {
        amountCzk: 349,
        currency: "CZK",
      },
      variant: {
        id: 123,
        sku: "VAR-1",
        name: "Test produkt, 90 kapslí",
        size: "90 kapslí",
      },
      benefits: ["Podpora energie", "Bez kofeinu"],
    });
  });
});
