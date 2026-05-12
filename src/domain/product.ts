export interface ProductImage {
  url: string;
}

export interface ProductPrice {
  amountCzk: number | null;
  currency: "CZK";
}

export interface ProductVariant {
  id: number;
  sku: string | null;
  name: string | null;
  size: string | null;
}

export interface ProductFacts {
  url: string;
  slug: string;
  name: string;
  description: string | null;
  sku: string | null;
  brand: string | null;
  category: string | null;
  goal: string | null;
  size: string | null;
  availability: string | null;
  price: ProductPrice;
  images: ProductImage[];
  variant: ProductVariant | null;
  ingredientsText: string | null;
  usageText: string | null;
  parametersText: string | null;
  benefits: string[];
  source: {
    jsonLd: boolean;
    dataLayer: boolean;
    dom: boolean;
  };
}
