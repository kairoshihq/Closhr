"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface ChartDataPoint {
  time: string;
  price: number;
}

const COINS = [
  { id: "bitcoin", symbol: "BTC", color: "#f7931a" },
  { id: "ethereum", symbol: "ETH", color: "#627eea" },
  { id: "solana", symbol: "SOL", color: "#00ffa3" },
];

const TIME_RANGES = ["1D", "7D", "1M", "3M", "1Y"];

// Generate mock chart data when API is unavailable
function generateMockData(days: number, basePrice: number): ChartDataPoint[] {
  const points: ChartDataPoint[] = [];
  const now = Date.now();
  const interval = (days * 24 * 60 * 60 * 1000) / 48;

  for (let i = 0; i < 48; i++) {
    const time = new Date(now - (47 - i) * interval);
    const variance = basePrice * 0.05;
    const price = basePrice + (Math.random() - 0.5) * variance * 2;
    points.push({
      time: time.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
      }),
      price: Math.round(price * 100) / 100,
    });
  }
  return points;
}

export default function PriceChart() {
  const [selectedCoin, setSelectedCoin] = useState(COINS[0]);
  const [timeRange, setTimeRange] = useState("7D");
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(false);

  const days = useMemo(() => {
    switch (timeRange) {
      case "1D": return 1;
      case "7D": return 7;
      case "1M": return 30;
      case "3M": return 90;
      case "1Y": return 365;
      default: return 7;
    }
  }, [timeRange]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function fetchChart() {
      try {
        const res = await fetch(
          `${API_URL}/market/${selectedCoin.id}?days=${days}`
        );
        if (!res.ok) throw new Error("API unavailable");
        const data = await res.json();

        if (!cancelled && Array.isArray(data.prices)) {
          const formatted = data.prices.map(
            (p: [number, number]) => ({
              time: new Date(p[0]).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
              price: Math.round(p[1] * 100) / 100,
            })
          );
          setChartData(formatted);
        }
      } catch {
        // Fallback to mock data
        if (!cancelled) {
          const basePrice =
            selectedCoin.symbol === "BTC"
              ? 109687
              : selectedCoin.symbol === "ETH"
              ? 2687
              : 141;
          setChartData(generateMockData(days, basePrice));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchChart();
    return () => {
      cancelled = true;
    };
  }, [selectedCoin, days]);

  const priceChange = chartData.length >= 2
    ? chartData[chartData.length - 1].price - chartData[0].price
    : 0;
  const positive = priceChange >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-[#111320] border border-[#1e2130] rounded-xl p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
          <span className="text-[10px] text-[#4a5568]">Live Update</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Coin selector */}
          <div className="flex gap-1">
            {COINS.map((coin) => (
              <button
                key={coin.id}
                onClick={() => setSelectedCoin(coin)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all",
                  selectedCoin.id === coin.id
                    ? "text-[#e2e8f0] border border-[#2a2f45]"
                    : "text-[#4a5568] hover:text-[#94a3b8]"
                )}
                style={
                  selectedCoin.id === coin.id
                    ? { backgroundColor: `${coin.color}15` }
                    : {}
                }
              >
                {coin.symbol}
              </button>
            ))}
          </div>

          {/* Time range selector */}
          <div className="flex gap-0.5 bg-[#0b0d11] rounded-lg p-0.5">
            {TIME_RANGES.map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-2 py-1 rounded text-[10px] transition-all",
                  timeRange === range
                    ? "bg-[#1a1d2e] text-[#e2e8f0]"
                    : "text-[#4a5568] hover:text-[#94a3b8]"
                )}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[200px] relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`gradient-${selectedCoin.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={selectedCoin.color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={selectedCoin.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e2130"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 9, fill: "#3a4058" }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 9, fill: "#3a4058" }}
                axisLine={false}
                tickLine={false}
                domain={["dataMin - 100", "dataMax + 100"]}
                width={60}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`
                }
              />
              <Tooltip
                contentStyle={{
                  background: "#151822",
                  border: "1px solid #2a2f45",
                  borderRadius: 8,
                  fontSize: 11,
                  color: "#e2e8f0",
                }}
                formatter={(value) => [`$${Number(value).toLocaleString()}`, "Price"]}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={selectedCoin.color}
                strokeWidth={2}
                fill={`url(#gradient-${selectedCoin.id})`}
                dot={false}
                activeDot={{
                  r: 4,
                  fill: selectedCoin.color,
                  stroke: "#111320",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer stats */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#1e2130]">
        <div>
          <p className="text-[9px] text-[#3a4058]">Current Price</p>
          <p className="text-[13px] font-mono text-[#e2e8f0]">
            ${chartData.length > 0 ? chartData[chartData.length - 1].price.toLocaleString() : "—"}
          </p>
        </div>
        <div>
          <p className="text-[9px] text-[#3a4058]">Change ({timeRange})</p>
          <p
            className={cn(
              "text-[13px] font-mono",
              positive ? "text-[#22c55e]" : "text-[#ef4444]"
            )}
          >
            {positive ? "+" : ""}${priceChange.toFixed(2)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
