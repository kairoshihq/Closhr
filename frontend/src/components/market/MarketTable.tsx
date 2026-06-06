"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn, formatPrice, formatMarketCap, formatVolume } from "@/lib/utils";
import { CoinPrice } from "@/types/market";

const TABS = ["All", "Trends", "Favorites", "Top Gainers", "Top Losers"];

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const color = positive ? "#22c55e" : "#ef4444";
  return (
    <div className="flex items-end gap-[2px] h-5">
      {data.map((h, i) => {
        const max = Math.max(...data);
        const pct = (h / max) * 100;
        return (
          <div
            key={i}
            className="w-[3px] rounded-sm"
            style={{ height: `${pct}%`, background: color }}
          />
        );
      })}
    </div>
  );
}

interface MarketTableProps {
  coins: CoinPrice[];
}

export default function MarketTable({ coins }: MarketTableProps) {
  const [activeTab, setActiveTab] = useState("All");
  const filtered = activeTab === "Top Gainers"
    ? [...coins].sort((a, b) => b.change1d - a.change1d)
    : activeTab === "Top Losers"
    ? [...coins].sort((a, b) => a.change1d - b.change1d)
    : coins;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
          <p className="text-[10px] text-[#4a5568]">Live updates</p>
          <p className="text-[13px] font-medium text-[#e2e8f0]">Market Overview</p>
        </div>
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "text-[10px] px-2 py-1 rounded transition-colors",
                activeTab === tab
                  ? "bg-[#1a1d2e] text-[#a78bfa] border border-[#3730a3]"
                  : "text-[#64748b] border border-transparent hover:text-[#94a3b8]"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]" style={{ tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "28px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "80px" }} />
            <col style={{ width: "52px" }} />
            <col style={{ width: "52px" }} />
            <col style={{ width: "52px" }} />
            <col style={{ width: "90px" }} />
            <col style={{ width: "76px" }} />
            <col style={{ width: "52px" }} />
          </colgroup>
          <thead>
            <tr className="border-b border-[#1a1d28]">
              {["No", "Coin/name", "Price", "1D%", "7D%", "30D%", "Market Cap", "Volume (1D)", "Chart"].map((h) => (
                <th key={h} className="text-left text-[#3a4058] font-normal py-1.5 px-1.5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((coin, i) => (
              <motion.tr
                key={coin.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="border-b border-[#12141c] hover:bg-[#111320] transition-colors"
              >
                <td className="py-1.5 px-1.5 text-[#3a4058]">{i + 1}</td>
                <td className="py-1.5 px-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-[18px] h-[18px] rounded-full bg-[#1a1d2e] flex items-center justify-center text-[9px] text-[#a78bfa] font-medium shrink-0">
                      {coin.symbol[0]}
                    </div>
                    <div>
                      <p className="text-[#e2e8f0] text-[11px] leading-tight">{coin.name}</p>
                      <p className="text-[9px] text-[#3a4058] leading-tight">{coin.symbol}</p>
                    </div>
                  </div>
                </td>
                <td className="py-1.5 px-1.5 text-[#e2e8f0] font-mono">${formatPrice(coin.price)}</td>
                {[coin.change1d, coin.change7d, coin.change30d].map((chg, ci) => (
                  <td key={ci} className={cn("py-1.5 px-1.5 font-mono", chg >= 0 ? "text-[#22c55e]" : "text-[#ef4444]")}>
                    {chg >= 0 ? "+" : ""}{chg.toFixed(2)}%
                  </td>
                ))}
                <td className="py-1.5 px-1.5 text-[#64748b]">{formatMarketCap(coin.marketCap)}</td>
                <td className="py-1.5 px-1.5 text-[#64748b]">{formatVolume(coin.volume24h)}</td>
                <td className="py-1.5 px-1.5">
                  <Sparkline data={coin.sparkline} positive={coin.change1d >= 0} />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}