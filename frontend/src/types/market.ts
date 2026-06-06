export interface CoinPrice {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change1d: number;
  change7d: number;
  change30d: number;
  marketCap: number;
  volume24h: number;
  sparkline: number[];
}

export interface TickerItem {
  symbol: string;
  price: number;
  change: number;
}