"use client";

import { Search, Bell, ChevronRight } from "lucide-react";
import TickerBar from "@/components/market/TickerBar";

export default function Navbar() {
  return (
    <header className="border-b border-[#1e2130] bg-[#0b0d11] sticky top-0 z-30">
      {/* Top navigation bar */}
      <div className="flex items-center justify-between px-4 h-11">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[12px]">
          <span className="text-[#4a5568]">Overview</span>
          <ChevronRight size={12} className="text-[#3a4058]" />
          <span className="text-[#e2e8f0] font-medium">Dashboard</span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-6">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3a4058]"
            />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-[#111320] border border-[#1e2130] rounded-lg pl-9 pr-4 py-1.5 text-[12px] text-[#e2e8f0] placeholder:text-[#3a4058] focus:outline-none focus:border-[#7c3aed] transition-colors"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-[#3a4058] bg-[#0b0d11] border border-[#1e2130] rounded px-1 py-0.5">
              /
            </kbd>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          <button className="relative p-1.5 rounded-lg hover:bg-[#111320] transition-colors">
            <Bell size={16} className="text-[#64748b]" />
            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-[#ef4444] rounded-full" />
          </button>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-[11px] font-medium text-[#e2e8f0] leading-tight">
                Your Wallet
              </p>
              <p className="text-[9px] text-[#4a5568] font-mono leading-tight">
                0x60fb...f1d5
              </p>
            </div>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#6d28d9] flex items-center justify-center text-[11px] text-white font-medium">
              J
            </div>
          </div>
        </div>
      </div>

      {/* Ticker bar */}
      <TickerBar />
    </header>
  );
}
