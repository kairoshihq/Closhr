"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import LiveCryptoUpdates from "@/components/market/LiveCryptoUpdates";
import CoinTable from "@/components/market/CoinTable";
import ExchangePanel from "@/components/portfolio/ExchangePanel";
import PriceChart from "@/components/charts/PriceChart";
import TopGainersLosers from "@/components/market/TopGainersLosers";
import { usePriceSocket } from "@/lib/websocket/usePriceSocket";
import { useMarketStore } from "@/lib/store/marketStore";
import { useEffect } from "react";

export default function DashboardPage() {
  // Connect to WebSocket for live price updates
  usePriceSocket(["BTC", "ETH", "SOL", "SUI"]);

  const { fetchMarket, fetchTrending } = useMarketStore();
  useEffect(() => {
    fetchMarket();
    fetchTrending();
  }, []);

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <div className="flex items-center gap-2 text-[12px] text-[#4a5568] mb-0.5">
            <span>Overview</span>
            <span>/</span>
            <span className="text-[#94a3b8]">Dashboard</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={12} className="text-[#4a5568]" />
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#1a1d2e] text-[#94a3b8] border border-[#2a2f45]">
            Last update: 2 min ago
          </span>
        </div>
      </motion.div>

      {/* Main Grid: Content + Right sidebar */}
      <div className="grid grid-cols-[1fr_280px] gap-4">
        {/* Left content */}
        <div className="space-y-4 min-w-0">
          {/* Live Crypto Updates */}
          <LiveCryptoUpdates />

          {/* Market Overview Table */}
          <CoinTable />

          {/* Price Chart */}
          <PriceChart />
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Exchange Widget */}
          <ExchangePanel />

          {/* Top Gainers & Losers */}
          <TopGainersLosers />
        </div>
      </div>
    </div>
  );
}
