"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useMarketStore } from "@/lib/store/marketStore";
import { MOCK_COINS } from "@/types/mockdata";

export default function TopGainersLosers() {
  const coins = useMarketStore((s) => s.coins);
  const data = coins.length > 0 ? coins : MOCK_COINS;

  const sorted = [...data].sort((a, b) => b.change1d - a.change1d);
  const gainers = sorted.slice(0, 3);
  const losers = sorted.slice(-3).reverse();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-[#111320] border border-[#1e2130] rounded-xl p-4"
    >
      {/* Top Gainers */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={13} className="text-[#22c55e]" />
            <span className="text-[12px] font-medium text-[#e2e8f0]">Top Gainers</span>
          </div>
          <button className="text-[9px] text-[#a78bfa] hover:text-[#c4b5fd] flex items-center gap-0.5 transition-colors">
            See all <ChevronRight size={10} />
          </button>
        </div>
        <div className="space-y-1.5">
          {gainers.map((coin) => (
            <div
              key={coin.id}
              className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-[#151822] transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#1a1d2e] flex items-center justify-center text-[9px] text-[#a78bfa] font-medium">
                  {coin.symbol[0]}
                </div>
                <div>
                  <p className="text-[11px] text-[#e2e8f0]">{coin.symbol}/USDT</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-[#e2e8f0] font-mono">${formatPrice(coin.price)}</p>
                <p className="text-[9px] text-[#22c55e] font-mono">
                  +{coin.change1d.toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Losers */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <TrendingDown size={13} className="text-[#ef4444]" />
            <span className="text-[12px] font-medium text-[#e2e8f0]">Top Losers</span>
          </div>
          <button className="text-[9px] text-[#a78bfa] hover:text-[#c4b5fd] flex items-center gap-0.5 transition-colors">
            See all <ChevronRight size={10} />
          </button>
        </div>
        <div className="space-y-1.5">
          {losers.map((coin) => (
            <div
              key={coin.id}
              className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-[#151822] transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#1a1d2e] flex items-center justify-center text-[9px] text-[#a78bfa] font-medium">
                  {coin.symbol[0]}
                </div>
                <div>
                  <p className="text-[11px] text-[#e2e8f0]">{coin.symbol}/USDT</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-[#e2e8f0] font-mono">${formatPrice(coin.price)}</p>
                <p className="text-[9px] text-[#ef4444] font-mono">
                  {coin.change1d.toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
