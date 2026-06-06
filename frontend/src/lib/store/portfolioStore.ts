import { create } from "zustand";
import type { PortfolioAsset } from "@/types/portfolio";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface PortfolioState {
  assets: PortfolioAsset[];
  walletBalance: number;
  loading: boolean;
  error: string | null;

  fetchPortfolio: () => Promise<void>;
  addAsset: (symbol: string, quantity: number, price: number) => Promise<void>;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  assets: [],
  walletBalance: 145195,
  loading: false,
  error: null,

  fetchPortfolio: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/portfolio`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Portfolio API error: ${res.status}`);
      const data = await res.json();
      set({
        assets: data.assets ?? data,
        walletBalance: data.walletBalance ?? 145195,
        loading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch portfolio",
        loading: false,
      });
    }
  },

  addAsset: async (symbol, quantity, price) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/portfolio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          assetSymbol: symbol,
          quantity,
          avgPrice: price,
        }),
      });
      if (!res.ok) throw new Error(`Failed to add asset: ${res.status}`);
      // Refresh after adding
      const portfolio = await fetch(`${API_URL}/portfolio`, {
        credentials: "include",
      });
      if (portfolio.ok) {
        const data = await portfolio.json();
        set({
          assets: data.assets ?? data,
          walletBalance: data.walletBalance ?? 145195,
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to add asset",
        loading: false,
      });
    }
  },
}));
