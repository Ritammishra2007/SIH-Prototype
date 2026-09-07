"use client";

import React from "react";
import Link from "next/link";
import { CollectorTopBar } from "@/components/collector/CollectorTopBar";
import { SafetyTipBanner } from "@/components/collector/SafetyTipBanner";
import { useLanguage } from "@/context/LanguageContext";
import {
  Clock,
  ArrowRight,
  PackageCheck,
  Truck,
  Sparkles,
  MapPin,
} from "lucide-react";

interface CollectorHomeClientProps {
  collector: {
    id: string;
    name: string | null;
    phone: string;
    generalLocation: string;
  } | null;
  pendingBalance: number;
  paidTotal: number;
  activeLotsCount: number;
  recentTransactions: Array<{
    id: string;
    lotId: string;
    materialCategory: string;
    weightKg: number;
    quotedValue: number;
    finalValue: number | null;
    paymentStatus: string;
    transactionStatus: string;
    createdAt: string;
    recycler: {
      name: string;
    } | null;
    traceability: {
      handoverReference: string;
      otpCode: string;
    } | null;
  }>;
}

export function CollectorHomeClient({
  collector,
  pendingBalance,
  paidTotal,
  activeLotsCount,
  recentTransactions,
}: CollectorHomeClientProps) {
  const { t, tStatus, tCategory, tPayment } = useLanguage();

  return (
    <div className="flex flex-col flex-1 pb-4 bg-white">
      {/* Persistent Top Bar with Language Dropdown */}
      <CollectorTopBar />

      <div className="p-4 space-y-4 flex-1">
        {/* Collector Welcome & Location Tag */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 block">
              {t("welcomeBack")}
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              {collector?.name || t("defaultCollectorName")}
            </h2>
          </div>
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-medium flex items-center gap-1">
            <MapPin className="w-3 h-3 text-blue-600" />
            <span>{collector?.generalLocation || "Delhi NCR"}</span>
          </span>
        </div>

        {/* 1. Big "New Lot" Call To Action Banner */}
        <Link
          href="/collector/new-lot"
          className="group block p-4 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white shadow-xl shadow-blue-600/25 hover:shadow-blue-600/35 transition-all duration-200 active:scale-[0.98]"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                <Sparkles className="w-3 h-3 text-blue-200" />
                <span>{t("instantBenchmarkRates")}</span>
              </div>
              <h3 className="text-lg font-bold text-white leading-tight">
                {t("logNewLotTitle")}
              </h3>
              <p className="text-xs text-blue-100">
                {t("logNewLotSubtitle")}
              </p>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-white text-blue-700 flex items-center justify-center font-bold shadow-md shrink-0 group-hover:scale-105 transition-transform ml-2">
              <span className="text-2xl font-black">+</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between text-xs font-semibold text-white">
            <span>{t("startNewLotBtn")}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* 2. Rotating Safety-Tip Banner */}
        <SafetyTipBanner />

        {/* 3. Earnings Ledger Shortcut & Pending Balance Card */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider block">
                  {t("ledgerShortcutTitle")}
                </span>
                <p className="text-2xl font-bold text-blue-700">
                  ₹{pendingBalance.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                {t("paidBalance")}
              </span>
              <p className="text-sm font-bold text-emerald-600">
                ₹{paidTotal.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <Link
            href="/collector/ledger"
            className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-semibold flex items-center justify-between transition active:scale-95 border border-slate-200"
          >
            <span>{t("viewLedgerBtn")}</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
          </Link>
        </div>

        {/* Active In-Handover Lots Glance */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {t("activeLotsTitle")} ({activeLotsCount})
            </span>
            <Link href="/collector/ledger" className="text-xs text-blue-600 font-semibold hover:underline">
              {t("seeAll")}
            </Link>
          </div>

          <div className="space-y-2">
            {recentTransactions.length > 0 ? (
              recentTransactions.slice(0, 3).map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-sm hover:border-slate-300 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                      {tx.transactionStatus === "COMPLETED" ? (
                        <PackageCheck className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Truck className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">
                          {tx.lotId}
                        </span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            tx.transactionStatus === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {tStatus(tx.transactionStatus)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {tCategory(tx.materialCategory)} • {tx.weightKg} {t("weightUnit")}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-bold text-blue-700">
                      ₹{(tx.finalValue || tx.quotedValue).toLocaleString("en-IN")}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {tPayment(tx.paymentStatus)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                {t("noActiveLots")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
