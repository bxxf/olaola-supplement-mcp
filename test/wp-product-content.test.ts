import { describe, expect, it } from "vitest";
import { fetchProductContentHints } from "../src/olaola/wp-product-content.js";

describe("fetchProductContentHints", () => {
  it("turns WP product_content entries into bounded contextual hints", async () => {
    const client = {
      async getText(url: string): Promise<string> {
        expect(url).toContain("/wp-json/wp/v2/product_content");
        expect(url).toContain("search=energie");
        expect(url).toContain("per_page=2");

        return JSON.stringify([
          {
            id: 20247,
            slug: "auto-draft-319",
            link: "https://www.olaola.cz/product-content/auto-draft-319/",
            title: { rendered: "Elektrolyty" },
            content: {
              rendered:
                "<style>.ignored{}</style><section><h3>Benefity</h3><p>Podpora energie&nbsp;a hydratace.</p></section>",
            },
          },
        ]);
      },
    };

    await expect(fetchProductContentHints({ query: "energie", maxHints: 2, client })).resolves.toEqual([
      {
        position: 1,
        wpId: 20247,
        slug: "auto-draft-319",
        url: "https://www.olaola.cz/product-content/auto-draft-319/",
        title: "Elektrolyty",
        snippet: "Benefity Podpora energie a hydratace.",
      },
    ]);
  });
});
