import { describe, expect, it } from "vitest";
import { extractAjaxNonce, extractProductModalContext, parseProductModalText } from "../src/olaola/product/modal.js";
import { readFixture } from "./fixtures.js";

describe("product modal helpers", () => {
  it("extracts AJAX nonce and modal context from product HTML", async () => {
    const productHtml = await readFixture("product-modal-page.html");

    expect(extractAjaxNonce(productHtml)).toBe("nonce-123");
    expect(extractProductModalContext(productHtml, "product-specification")).toBe("378");
    expect(extractProductModalContext(productHtml, "product-instructions")).toBe("379");
    expect(extractProductModalContext(productHtml, "product-parameters")).toBeNull();
  });

  it("normalizes modal body text from AJAX JSON", () => {
    const response = JSON.stringify({
      success: true,
      data: {
        fragments: {
          append: {
            body: "<div><h2>Složení</h2><p>Hořčík 77 mg&nbsp;v sáčku.</p><script>ignored()</script></div>",
          },
        },
      },
    });

    expect(parseProductModalText(response)).toBe("Složení Hořčík 77 mg v sáčku.");
  });
});
