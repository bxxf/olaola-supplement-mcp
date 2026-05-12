export interface OlaolaOrderSummary {
  orderNumber: string;
  detailUrl: string | null;
  status: string | null;
  orderedAt: string | null;
  paymentStatus: string | null;
  totalPriceCzk: number | null;
  productUrls: string[];
}

export interface OlaolaOrderDetail extends OlaolaOrderSummary {
  text: string;
}
