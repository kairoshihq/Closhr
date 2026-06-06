"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Wallet, MoreVertical, Fuel } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useMarketStore } from "@/lib/store/marketStore";
import { usePortfolioStore } from "@/lib/store/portfolioStore";

const COINS = [
  { symbol: "ETH", name: "Ethereum", color: "#627eea" },
  { symbol: "BTC", name: "Bitcoin", color: "#f7931a" },
  { symbol: "SOL", name: "Solana", color: "#00ffa3" },
];

type Tab = "Buy" | "Sell" | "Swap";

export default function ExchangePanel() {
  const [tab, setTab] = useState<Tab>("Buy");
  const [selectedCoin, setSelectedCoin] = useState(COINS[0]);
  const [spendAmount, setSpendAmount] = useState("90020.9");
  const [sliderValue, setSliderValue] = useState(62);

  const livePrices = useMarketStore((s) => s.livePrices);
  const walletBalance = usePortfolioStore((s) => s.walletBalance);
  const addAsset = usePortfolioStore((s) => s.addAsset);

  const coinPrice = livePrices[selectedCoin.symbol] || (selectedCoin.symbol === "ETH" ? 2687.63 : selectedCoin.symbol === "BTC" ? 109687.6 : 141.75);
  const gasFee = 2.5;

  const receiveAmount = useMemo(() => {
    const spend = parseFloat(spendAmount) || 0;
    if (coinPrice <= 0) return 0;
    return (spend - gasFee) / coinPrice;
  }, [spendAmount, coinPrice, gasFee]);

  const handleBuy = async () => {
    const spend = parseFloat(spendAmount) || 0;
    if (spend <= 0) return;
    try {
      await addAsset(selectedCoin.symbol, receiveAmount, coinPrice);
    } catch (err) {
      console.error("Buy failed:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-[#111320] border border-[#1e2130] rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2130]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#052010] text-[#22c55e]">
            Get 2.5% off fees for next
          </span>
          <span className="text-[11px] text-[#a78bfa] font-mono">16:09:46</span>
        </div>
      </div>

      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-[14px] font-medium text-[#e2e8f0]">Exchange</h3>
            <p className="text-[10px] text-[#4a5568]">Advanced trading tool</p>
          </div>
          <button className="p-1 rounded hover:bg-[#151822] transition-colors">
            <MoreVertical size={14} className="text-[#3a4058]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4">
          {(["Buy", "Sell", "Swap"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-[11px] font-medium transition-all",
                tab === t
                  ? "bg-[#1a1d2e] text-[#e2e8f0] border border-[#2a2f45]"
                  : "text-[#4a5568] hover:text-[#94a3b8]"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Wallet Balance */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet size={14} className="text-[#4a5568]" />
            <span className="text-[11px] text-[#4a5568]">Wallet balance</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-medium text-[#e2e8f0] font-mono">
              {formatPrice(walletBalance)} USDT
            </span>
            <button className="p-0.5 rounded hover:bg-[#151822] transition-colors">
              <ArrowRight size={12} className="text-[#3a4058]" />
            </button>
          </div>
        </div>

        {/* Spend Input */}
        <div className="space-y-3 mb-4">
          <div className="bg-[#0b0d11] border border-[#1e2130] rounded-lg p-3">
            <p className="text-[10px] text-[#4a5568] mb-1.5">Spend</p>
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={spendAmount}
                onChange={(e) => setSpendAmount(e.target.value)}
                className="bg-transparent text-[15px] font-mono text-[#e2e8f0] w-full outline-none"
              />
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <div className="w-5 h-5 rounded-full bg-[#22c55e] flex items-center justify-center">
                  <span className="text-[8px] text-white font-bold">$</span>
                </div>
                <span className="text-[11px] text-[#94a3b8] font-medium">USDT</span>
              </div>
            </div>
          </div>

          {/* Swap indicator */}
          <div className="flex justify-center">
            <div className="w-7 h-7 rounded-full bg-[#1a1d2e] border border-[#2a2f45] flex items-center justify-center">
              <ArrowRight size={12} className="text-[#a78bfa] rotate-90" />
            </div>
          </div>

          {/* Receive Input */}
          <div className="bg-[#0b0d11] border border-[#1e2130] rounded-lg p-3">
            <p className="text-[10px] text-[#4a5568] mb-1.5">Receive</p>
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-mono text-[#e2e8f0]">
                {receiveAmount.toFixed(6)}
              </span>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: selectedCoin.color }}
                >
                  <span className="text-[8px] text-white font-bold">
                    {selectedCoin.symbol[0]}
                  </span>
                </div>
                <select
                  value={selectedCoin.symbol}
                  onChange={(e) =>
                    setSelectedCoin(COINS.find((c) => c.symbol === e.target.value) ?? COINS[0])
                  }
                  className="bg-transparent text-[11px] text-[#94a3b8] font-medium outline-none cursor-pointer"
                >
                  {COINS.map((c) => (
                    <option key={c.symbol} value={c.symbol} className="bg-[#111320]">
                      {c.symbol}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Rate info */}
        <p className="text-[9px] text-[#3a4058] mb-2 text-center">
          1 USDT = {(1 / coinPrice).toFixed(8)} {selectedCoin.symbol}
        </p>

        {/* Slider */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <div className="h-1.5 flex-1 bg-[#1a1d2e] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, #7c3aed, ${selectedCoin.color})`,
                  width: `${sliderValue}%`,
                }}
                layout
                transition={{ duration: 0.2 }}
              />
            </div>
            <span className="text-[11px] text-[#e2e8f0] font-mono ml-3">
              {sliderValue}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={sliderValue}
            onChange={(e) => {
              const pct = parseInt(e.target.value);
              setSliderValue(pct);
              setSpendAmount(((walletBalance * pct) / 100).toFixed(2));
            }}
            className="w-full h-1 accent-[#7c3aed] opacity-0 cursor-pointer -mt-2.5 relative z-10"
          />
        </div>

        {/* Gas Fee */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <Fuel size={12} className="text-[#4a5568]" />
            <span className="text-[11px] text-[#4a5568]">Gas fee</span>
          </div>
          <span className="text-[11px] text-[#e2e8f0] font-mono">${gasFee.toFixed(2)} USD</span>
        </div>

        {/* Buy Button */}
        <button
          onClick={handleBuy}
          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white text-[12px] font-medium hover:from-[#6d28d9] hover:to-[#5b21b6] transition-all flex items-center justify-center gap-2 glow-accent"
        >
          Buy {selectedCoin.symbol}
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Total Transaction */}
      <div className="px-4 py-3 border-t border-[#1e2130]">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] text-[#4a5568]">Total Transaction</p>
          <MoreVertical size={12} className="text-[#3a4058]" />
        </div>
        <p className="text-[18px] font-medium text-[#e2e8f0] font-mono">$4,837.00 USD</p>
        <span className="text-[10px] px-2 py-0.5 rounded bg-[#052010] text-[#22c55e] mt-1 inline-block">
          42% From Previous Month
        </span>

        {/* Mini chart placeholder */}
        <div className="mt-3 h-16 bg-[#0b0d11] rounded-lg border border-[#1e2130] overflow-hidden">
          <svg viewBox="0 0 200 60" width="100%" height="100%" preserveAspectRatio="none">
            <defs>
              <linearGradient id="txGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,45 L20,42 L40,38 L60,40 L80,30 L100,35 L120,25 L140,28 L160,18 L180,22 L200,15"
              fill="none"
              stroke="#22c55e"
              strokeWidth="1.5"
            />
            <path
              d="M0,45 L20,42 L40,38 L60,40 L80,30 L100,35 L120,25 L140,28 L160,18 L180,22 L200,15 L200,60 L0,60Z"
              fill="url(#txGrad)"
            />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}
