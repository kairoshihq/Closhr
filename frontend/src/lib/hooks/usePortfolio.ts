"use client";

import { useEffect } from "react";
import { usePortfolioStore } from "@/lib/store/portfolioStore";

/**
 * Hook to fetch portfolio data from the API.
 * Auto-refreshes every 2 minutes.
 */
export function usePortfolio() {
  const { assets, walletBalance, loading, error, fetchPortfolio, addAsset } =
    usePortfolioStore();

  useEffect(() => {
    fetchPortfolio();

    const interval = setInterval(fetchPortfolio, 120_000);
    return () => clearInterval(interval);
  }, [fetchPortfolio]);

  return { assets, walletBalance, loading, error, addAsset };
}
