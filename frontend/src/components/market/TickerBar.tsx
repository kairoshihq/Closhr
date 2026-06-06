"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import { TickerItem } from "@/types/market";
import { MOCK_TICKERS } from "@/lib/mockData";

function TickerChip({ item }: { item: TickerItem }) {
  const positive = item.change >= 0;
  return (
    <div className="flex items-center gap-2 px-3.5 py-2 border-r border-[#1e2130] shrink-0">
      <span className="text-[11px] font-medium text-[#94a3b8]">{item.symbol}</span>
      <span className="text-[11px] text-[#e2e8f0] font-mono">${formatPrice(item.price)}</span>
      <span className={cn("text-[10px] font-mono", positive ? "text-[#22c55e]" : "text-[#ef4444]")}>
        {positive ? "+" : ""}{item.change.toFixed(2)}%
      </span>
    </div>
  );
}

export default function TickerBar() {
  const items = [...MOCK_TICKERS, ...MOCK_TICKERS];
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let x = 0;
    let raf: number;
    const tick = () => {
      x -= 0.5;
      const half = el.scrollWidth / 2;
      if (Math.abs(x) >= half) x = 0;
      el.style.transform = `translateX(${x}px)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="border-b border-[#1e2130] bg-[#0b0d11] overflow-hidden">
      <div ref={ref} className="flex w-max">
        {items.map((item, i) => (
          <TickerChip key={i} item={item} />
        ))}
      </div>
    </div>
  );
}