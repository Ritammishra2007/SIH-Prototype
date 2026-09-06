"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ScanLine, History } from "lucide-react";

export function RecyclerNav() {
  const pathname = usePathname();

  if (pathname.includes("/login")) return null;

  const isActive = (path: string) => {
    if (path === "/recycler/dashboard") return pathname === "/recycler/dashboard";
    return pathname.startsWith(path);
  };

  return (
    <div className="bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 select-none shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-around relative">
        {/* Tab 1: Dashboard */}
        <Link
          href="/recycler/dashboard"
          className={`flex flex-col items-center justify-center w-20 py-1.5 transition-colors ${
            isActive("/recycler/dashboard")
              ? "text-blue-600 font-bold"
              : "text-slate-400 hover:text-slate-700"
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-medium tracking-tight">Queue</span>
        </Link>

        {/* Center CTA Button: Verify Intake */}
        <Link
          href="/recycler/verify"
          className="flex flex-col items-center justify-center -mt-6 group focus:outline-none"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 group-active:scale-95 transition-all border-2 border-white">
            <ScanLine className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-bold text-blue-700 mt-1">
            Intake Scan
          </span>
        </Link>

        {/* Tab 2: History */}
        <Link
          href="/recycler/history"
          className={`flex flex-col items-center justify-center w-20 py-1.5 transition-colors ${
            isActive("/recycler/history")
              ? "text-blue-600 font-bold"
              : "text-slate-400 hover:text-slate-700"
          }`}
        >
          <History className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-medium tracking-tight">History</span>
        </Link>
      </div>
    </div>
  );
}
