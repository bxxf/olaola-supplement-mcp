import { OlaolaParseError } from "../../errors.js";

export interface CartAjaxResponse {
  success?: boolean;
  data?: {
    fragments?: {
      append?: {
        body?: string;
      };
      replace?: Record<string, string>;
    };
  };
}

export function extractSidebarCartFragment(responseText: string): string {
  const response = parseCartAjaxResponse(responseText);

  if (!response.success) {
    throw new OlaolaParseError("OlaOla cart request failed");
  }

  const sidebarCart = response.data?.fragments?.replace?.["#sidebar-cart"];
  if (sidebarCart) return sidebarCart;

  const appendedBody = response.data?.fragments?.append?.body;
  if (appendedBody) return appendedBody;

  throw new OlaolaParseError("OlaOla cart response did not include #sidebar-cart");
}

function parseCartAjaxResponse(responseText: string): CartAjaxResponse {
  try {
    return JSON.parse(responseText) as CartAjaxResponse;
  } catch (error) {
    throw new OlaolaParseError("OlaOla cart response was not valid JSON", { cause: error });
  }
}
