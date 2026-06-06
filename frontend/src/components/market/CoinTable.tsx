"use client";

import MarketTable from "@/components/market/MarketTable";
import { useMarketData } from "@/lib/hooks/useMarketData";

/**
 * CoinTable wraps MarketTable with data-fetching via useMarketData hook.
 * This is the entry-point component used in the dashboard.
 */
export default function CoinTable() {
  const { coins, loading } = useMarketData();

  if (loading && coins.length === 0) {
    return (
      <div className="bg-[#111320] border border-[#1e2130] rounded-xl p-6">
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
          <span className="text-[12px] text-[#4a5568]">Loading market data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#111320] border border-[#1e2130] rounded-xl p-4">
      <MarketTable coins={coins} />
      <div className="flex justify-end mt-2">
        <button className="text-[10px] text-[#a78bfa] hover:text-[#c4b5fd] transition-colors">
          See all →
        </button>
      </div>
    </div>
  );
}
