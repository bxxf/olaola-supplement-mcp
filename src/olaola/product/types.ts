export interface DataLayerProduct {
  id?: string[];
  variant?: string[];
  name?: string[];
  nameWeb?: string[];
  priceVat?: number[];
  category?: string[];
  brand?: string[];
  goal?: string[];
  nameVariant?: string[];
  size?: string[];
}

export interface JsonLdProduct {
  "@type"?: string;
  name?: string;
  description?: string;
  sku?: string;
  category?: string;
  image?: string[];
  offers?: {
    availability?: string;
    price?: number | string;
    priceCurrency?: string;
    url?: string;
  };
}

export interface ProductPageFallbacks {
  title: string | null;
  metaDescription: string | null;
  variantId: number | null;
  benefits: string[];
}

export interface ProductPageSources {
  jsonLdProduct: JsonLdProduct | null;
  dataLayerProduct: DataLayerProduct | null;
  fallbacks: ProductPageFallbacks;
}
