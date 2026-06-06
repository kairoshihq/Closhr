"use client";
import { motion } from "framer-motion";
import { MoreVertical } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

const COIN_STYLES: Record<string, { bg: string; text: string }> = {
  BTC: { bg: "#2a1f00", text: "#f59e0b" },
  ETH: { bg: "#1a1535", text: "#8b5cf6" },
  SUI: { bg: "#0a1f2a", text: "#06b6d4" },
  SOL: { bg: "#0a1f2a", text: "#06b6d4" },
};

interface PriceCardProps {
  symbol: string;
  name: string;
  pair: string;
  price: number;
  change: number;
  sparkline: number[];
  index?: number;
}

export default function PriceCard({ symbol, name, pair, price, change, sparkline, index = 0 }: PriceCardProps) {
  const positive = change >= 0;
  const style = COIN_STYLES[symbol] ?? { bg: "#1a1d2e", text: "#a78bfa" };
  const max = Math.max(...sparkline);
  const min = Math.min(...sparkline);
  const range = max - min || 1;
  const pts = sparkline
    .map((v, i) => `${(i / (sparkline.length - 1)) * 100},${30 - ((v - min) / range) * 28}`)
    .join(" ");
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      className="bg-[#111320] border border-[#1e2130] rounded-[10px] p-3 hover:border-[#2a2f45] transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-medium shrink-0"
            style={{ background: style.bg, color: style.text }}
          >
            {symbol[0]}
          </div>
          <div>
            <p className="text-[11px] text-[#94a3b8] leading-tight">{pair}</p>
            <p className="text-[10px] text-[#4a5568] leading-tight">{name}</p>
          </div>
        </div>
        <MoreVertical size={14} className="text-[#3a4058]" />
      </div>
      <p className="text-[10px] text-[#4a5568] mb-0.5">Price</p>
      <p className="text-[17px] font-medium text-[#e2e8f0] font-mono leading-tight">
        ${formatPrice(price)}
      </p>
      <span className={cn(
        "inline-block text-[10px] px-1.5 py-0.5 rounded mt-1",
        positive ? "bg-[#052010] text-[#22c55e]" : "bg-[#1f0505] text-[#ef4444]"
      )}>
        {positive ? "+" : ""}{change.toFixed(2)}%
      </span>
      <div className="mt-2">
        <svg viewBox="0 0 100 30" width="100%" height="30" preserveAspectRatio="none">
          <polyline
            points={pts}
            fill="none"
            stroke={positive ? "#22c55e" : "#ef4444"}
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </motion.div>
  );
}