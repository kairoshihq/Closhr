export interface PortfolioAsset {
  id: string;
  assetSymbol: string;
  quantity: number;
  avgPrice: number;
  createdAt: string;
}

export interface WalletBalance {
  totalUsd: number;
  assets: PortfolioAsset[];
}

export interface BuyOrder {
  symbol: string;
  amountUsd: number;
  estimatedQty: number;
  gasFee: number;
}
