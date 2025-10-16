
export interface SellingRates {
  below1M_MMK: number;
  above1M_MMK: number;
  special_100_500?: string;
}

export interface BuyingRates {
  base: number;
  above1M_MMK: number;
}

export interface ExchangeRate {
  id: string;
  date: string;
  paymentMethod: string;
  sellingRates: SellingRates;
  buyingRates: BuyingRates;
  notes: string[];
}

export type HistoryEntry = ExchangeRate;
