import { create } from "zustand";
import type { CoinPrice, TickerItem } from "@/types/market";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface MarketState {
  coins: CoinPrice[];
  tickers: TickerItem[];
  trending: CoinPrice[];
  loading: boolean;
  error: string | null;
  livePrices: Record<string, number>;
  liveChanges: Record<string, number>;
  _refreshTimer: ReturnType<typeof setInterval> | null;

  fetchMarket: () => Promise<void>;
  fetchTrending: () => Promise<void>;
  updateLivePrice: (symbol: string, price: number, change: number) => void;
  getLivePrice: (symbol: string, fallback: number) => number;
  startAutoRefresh: (intervalMs?: number) => void;
  stopAutoRefresh: () => void;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  coins: [],
  tickers: [],
  trending: [],
  loading: false,
  error: null,
  livePrices: {},
  liveChanges: {},
  _refreshTimer: null,

  fetchMarket: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/market`, {
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error(`Market API error: ${res.status}`);
      const data: CoinPrice[] = await res.json();
      set({
        coins: data,
        tickers: data.map((c) => ({
          symbol: `${c.symbol}/USDT`,
          price: c.price,
          change: c.change1d,
        })),
        loading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch market data",
        loading: false,
      });
    }
  },

  fetchTrending: async () => {
    try {
      if (typeof window === "undefined") return;
      const res = await fetch(`${API_URL}/market/trending`, {
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error(`Trending API error: ${res.status}`);
      const data: CoinPrice[] = await res.json();
      set({ trending: data });
    } catch (err) {
      console.warn("Trending fetch failed:", err);
    }
  },

  updateLivePrice: (symbol, price, change) => {
    set((state) => ({
      livePrices: { ...state.livePrices, [symbol]: price },
      liveChanges: { ...state.liveChanges, [symbol]: change },
    }));
  },

  getLivePrice: (symbol, fallback) => {
    return get().livePrices[symbol] ?? fallback;
  },

  // Mulai auto-refresh setiap 60 detik (sesuai cache backend)
  startAutoRefresh: (intervalMs = 60000) => {
    get().stopAutoRefresh(); // clear timer lama jika ada
    get().fetchMarket();
    get().fetchTrending();
    const timer = setInterval(() => {
      get().fetchMarket();
      get().fetchTrending();
    }, intervalMs);
    set({ _refreshTimer: timer });
  },

  stopAutoRefresh: () => {
    const timer = get()._refreshTimer;
    if (timer) {
      clearInterval(timer);
      set({ _refreshTimer: null });
    }
  },
}));