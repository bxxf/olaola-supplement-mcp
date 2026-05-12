import { describe, expect, it } from "vitest";
import { fetchProductSitemapEntries } from "../src/olaola/product-sitemap.js";
import { fetchSitemapProductUrls } from "../src/olaola/retrieval/sitemap-candidates.js";

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset>
  <url><loc>https://www.olaola.cz/produkt/horcik-podporujici-mozek-l-treonat-90-kapsli/</loc></url>
  <url><loc>https://www.olaola.cz/produkt/magnesium-spanek-90-kapsli/</loc></url>
  <url><loc>https://www.olaola.cz/blog/ignored/</loc></url>
</urlset>`;

describe("product sitemap retrieval", () => {
  it("extracts product URLs from the product sitemap", async () => {
    const client = {
      async getText(): Promise<string> {
        return sitemapXml;
      },
    };

    await expect(fetchProductSitemapEntries(client)).resolves.toEqual([
      {
        url: "https://www.olaola.cz/produkt/horcik-podporujici-mozek-l-treonat-90-kapsli/",
        slug: "horcik-podporujici-mozek-l-treonat-90-kapsli",
      },
      {
        url: "https://www.olaola.cz/produkt/magnesium-spanek-90-kapsli/",
        slug: "magnesium-spanek-90-kapsli",
      },
    ]);
  });

  it("finds Czech slug variants for English ingredient wording", async () => {
    const client = {
      async getText(): Promise<string> {
        return sitemapXml;
      },
    };

    await expect(
      fetchSitemapProductUrls({
        query: "l-threonate",
        maxUrls: 3,
        client,
      }),
    ).resolves.toEqual(["https://www.olaola.cz/produkt/horcik-podporujici-mozek-l-treonat-90-kapsli/"]);
  });
});
