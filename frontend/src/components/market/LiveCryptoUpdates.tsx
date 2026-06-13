"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import PriceCard from "@/components/market/PriceCard";
import { useMarketStore } from "@/lib/store/marketStore";
import { MOCK_PRICE_CARDS } from "@/types/mockdata";

const FEATURED_SYMBOLS = ["BTC", "ETH", "SUI"];

export default function LiveCryptoUpdates() {
  const coins = useMarketStore((s) => s.coins);
  const livePrices = useMarketStore((s) => s.livePrices);
  const liveChanges = useMarketStore((s) => s.liveChanges);

const baseCards = coins.length > 0
    ? (FEATURED_SYMBOLS.map((sym) => {
        const coin = coins.find((c) => c.symbol === sym);
        if (!coin) return null;
        return {
          id: coin.id,
          symbol: coin.symbol,
          name: coin.name,
          pair: `${coin.symbol}/USDT`,
          price: coin.price,
          change: coin.change1d,
          sparkline: coin.sparkline,
        };
      }).filter((c): c is NonNullable<typeof c> => c !== null))
    : MOCK_PRICE_CARDS;

  const cards = baseCards.map((card) => ({
    ...card,
    price: livePrices[card!.symbol] ?? card!.price,
    change: liveChanges[card!.symbol] ?? card!.change,
  }));

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
            <span className="text-[10px] text-[#4a5568]">Last update: 2 min ago</span>
          </div>
          <h2 className="text-[16px] font-medium text-[#e2e8f0] flex items-center gap-1.5">
            Live Crypto Updates
            <span className="text-[14px]">🚀</span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <select className="bg-[#111320] border border-[#1e2130] rounded-lg text-[10px] text-[#94a3b8] px-2 py-1 outline-none cursor-pointer">
            <option>USDT</option>
            <option>USD</option>
            <option>BTC</option>
          </select>
          <select className="bg-[#111320] border border-[#1e2130] rounded-lg text-[10px] text-[#94a3b8] px-2 py-1 outline-none cursor-pointer">
            <option>Top Gainers</option>
            <option>Top Losers</option>
            <option>Volume</option>
          </select>
          <select className="bg-[#111320] border border-[#1e2130] rounded-lg text-[10px] text-[#94a3b8] px-2 py-1 outline-none cursor-pointer">
            <option>7D</option>
            <option>1D</option>
            <option>1M</option>
          </select>
          <button className="flex items-center gap-1 text-[10px] text-[#a78bfa] hover:text-[#c4b5fd] transition-colors">
            See all <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-3 gap-3">
        {cards.map((card, i) => (
          <PriceCard
            key={card!.id}
            symbol={card!.symbol}
            name={card!.name}
            pair={card!.pair}
            price={card!.price}
            change={card!.change}
            sparkline={card!.sparkline}
            index={i}
          />
        ))}
      </div>
    </motion.section>
  );
}