export interface CartItem {
  cartItemId: number | null;
  name: string;
  url: string | null;
  sku: string | null;
  variantId: number | null;
  quantity: number;
  unitPriceCzk: number | null;
  linePriceCzk: number | null;
  subscription: boolean;
}

export interface CartSnapshot {
  source: "shadow_cart" | "user_cart";
  authenticated: boolean;
  items: CartItem[];
  subtotalCzk: number | null;
  itemCount: number;
}

export function emptyShadowCartSnapshot(): CartSnapshot {
  return {
    source: "shadow_cart",
    authenticated: false,
    items: [],
    subtotalCzk: null,
    itemCount: 0,
  };
}
