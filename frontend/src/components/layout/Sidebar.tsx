"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Briefcase, Wallet, Star,
  ArrowLeftRight, Receipt, Lightbulb, BarChart2,
  TrendingUp, Headphones, Settings, LogOut,
} from "lucide-react";

const NAV = [
  {
    section: "Overview",
    items: [{ label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", badge: "1" }],
  },
  {
    section: "Account",
    items: [
      { label: "Portfolio", icon: Briefcase, href: "/portfolio" },
      { label: "Wallet", icon: Wallet, href: "/wallet" },
      { label: "Watchlist", icon: Star, href: "/watchlist" },
    ],
  },
  {
    section: "Activity",
    items: [
      { label: "Trade", icon: ArrowLeftRight, href: "/trade" },
      { label: "Transactions", icon: Receipt, href: "/transactions" },
    ],
  },
  {
    section: "Others",
    items: [
      { label: "Insights", icon: Lightbulb, href: "/insights" },
      { label: "Analytics", icon: BarChart2, href: "/analytics", badge: "Beta" },
      { label: "Market Trends", icon: TrendingUp, href: "/market-trends" },
    ],
  },
  {
    section: "Support",
    items: [
      { label: "Support", icon: Headphones, href: "/support", badge: "2" },
      { label: "Settings", icon: Settings, href: "/settings" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-[168px] bg-[#0b0d11] border-r border-[#1e2130] flex flex-col shrink-0 h-screen sticky top-0">
      <div className="flex items-center gap-2 px-4 py-4 border-b border-[#1e2130]">
        <div className="w-7 h-7 rounded-lg bg-[#7c3aed] flex items-center justify-center text-white text-sm font-medium shrink-0">
          K
        </div>
        <div>
          <p className="text-[13px] font-medium text-[#e2e8f0] leading-tight">Kairoshi</p>
          <p className="text-[10px] text-[#4a5568] leading-tight">AI-Powered Trading</p>
        </div>
      </div>
      <div className="px-3 py-3 border-b border-[#1e2130]">
        <p className="text-[13px] font-medium text-[#e2e8f0]">Welcome back,</p>
        <p className="text-[15px] font-medium text-[#e2e8f0]">Jason</p>
        <p className="text-[10px] text-[#4a5568] mt-0.5">Last login: 15 Jun 2025</p>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {NAV.map((group) => (
          <div key={group.section} className="mb-1">
            <p className="text-[9px] text-[#3a4058] uppercase tracking-widest px-4 py-1.5">{group.section}</p>
            {group.items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-[7px] text-[12px] transition-colors",
                    active ? "text-[#e2e8f0] bg-[#151822]" : "text-[#64748b] hover:text-[#a0aec0] hover:bg-[#111320]"
                  )}
                >
                  <item.icon size={15} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className={cn(
                      "text-[9px] px-1.5 py-0.5 rounded",
                      item.badge === "Beta"
                        ? "bg-[#1a2035] text-[#4a5578]"
                        : "bg-[#7c3aed] text-[#e2c6ff]"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="border-t border-[#1e2130] px-4 py-3">
        <button className="flex items-center gap-2 text-[12px] text-[#64748b] hover:text-[#a0aec0] transition-colors w-full">
          <LogOut size={15} />
          Log out
        </button>
      </div>
    </aside>
  );
}