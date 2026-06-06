"use client";

import { useEffect } from "react";
import { useMarketStore } from "@/lib/store/marketStore";
import { MOCK_COINS } from "@/types/mockdata";

/**
 * Hook to fetch market data from the API.
 * Falls back to mock data if the API is unavailable.
 * Auto-refreshes every 60 seconds.
 */
export function useMarketData() {
  const { coins, tickers, loading, error, fetchMarket, fetchTrending } =
    useMarketStore();

  useEffect(() => {
    fetchMarket().catch(() => {
      // If API fails, populate with mock data so the UI still renders
      useMarketStore.setState({
        coins: MOCK_COINS,
        tickers: MOCK_COINS.map((c) => ({
          symbol: `${c.symbol}/USDT`,
          price: c.price,
          change: c.change1d,
        })),
        loading: false,
      });
    });

    fetchTrending();

    // Auto-refresh every 60s
    const interval = setInterval(() => {
      fetchMarket();
      fetchTrending();
    }, 60_000);

    return () => clearInterval(interval);
  }, [fetchMarket, fetchTrending]);

  return { coins: coins.length > 0 ? coins : MOCK_COINS, tickers, loading, error };
}
