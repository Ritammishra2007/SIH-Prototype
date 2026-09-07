"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TrendingUp, ReceiptText, User, Plus } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function CollectorNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  if (pathname.includes("/login")) return null;

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <div className="bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-2 select-none shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-around relative max-w-[430px] mx-auto">
        {/* Tab 1: Home */}
        <Link
          href="/collector/home"
          className={`flex flex-col items-center justify-center w-14 py-1.5 transition-colors ${
            isActive("/collector/home")
              ? "text-blue-600 font-bold"
              : "text-slate-400 hover:text-slate-700"
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-medium tracking-tight">
            {t("home")}
          </span>
        </Link>

        {/* Tab 2: Rates / Price Board */}
        <Link
          href="/collector/prices"
          className={`flex flex-col items-center justify-center w-14 py-1.5 transition-colors ${
            isActive("/collector/prices")
              ? "text-blue-600 font-bold"
              : "text-slate-400 hover:text-slate-700"
          }`}
        >
          <TrendingUp className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-medium tracking-tight">
            {t("pricesNav")}
          </span>
        </Link>

        {/* Center CTA Button: + New Lot */}
        <Link
          href="/collector/new-lot"
          className="flex flex-col items-center justify-center -mt-6 group focus:outline-none"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 group-active:scale-95 transition-all border-2 border-white">
            <Plus className="w-6 h-6 stroke-[3]" />
          </div>
          <span className="text-[10px] font-bold text-blue-700 mt-1">
            {t("newLot")}
          </span>
        </Link>

        {/* Tab 3: Ledger */}
        <Link
          href="/collector/ledger"
          className={`flex flex-col items-center justify-center w-14 py-1.5 transition-colors ${
            isActive("/collector/ledger")
              ? "text-blue-600 font-bold"
              : "text-slate-400 hover:text-slate-700"
          }`}
        >
          <ReceiptText className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-medium tracking-tight">
            {t("ledger")}
          </span>
        </Link>

        {/* Tab 4: Profile */}
        <Link
          href="/collector/profile"
          className={`flex flex-col items-center justify-center w-14 py-1.5 transition-colors ${
            isActive("/collector/profile")
              ? "text-blue-600 font-bold"
              : "text-slate-400 hover:text-slate-700"
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-medium tracking-tight">
            {t("profile")}
          </span>
        </Link>
      </div>
    </div>
  );
}
