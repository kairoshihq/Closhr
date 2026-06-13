"use client";

import { useEffect } from "react";
import { useMarketStore } from "@/lib/store/marketStore";
import { MOCK_COINS } from "@/types/mockdata";

export function useMarketData() {
  const { coins, tickers, loading, error, fetchMarket, fetchTrending } =
    useMarketStore();

  useEffect(() => {
    fetchMarket().catch(() => {
      if (useMarketStore.getState().coins.length === 0) {
        useMarketStore.setState({
          coins: MOCK_COINS,
          tickers: MOCK_COINS.map((c) => ({
            symbol: `${c.symbol}/USDT`,
            price: c.price,
            change: c.change1d,
          })),
          loading: false,
        });
      }
    });

    fetchTrending();

    const interval = setInterval(() => {
      fetchMarket();
      fetchTrending();
    }, 60_000);

    return () => clearInterval(interval);
  }, [fetchMarket, fetchTrending]);

  return {
    coins: coins.length > 0 ? coins : loading ? [] : MOCK_COINS,
    tickers,
    loading,
    error,
  };
}