"use client";

import React from "react";
import Link from "next/link";
import { RecyclerTopBar } from "@/components/recycler/RecyclerTopBar";
import {
  Factory,
  ArrowRight,
  Scale,
  MapPin,
  ChevronRight,
  ScanLine,
} from "lucide-react";

interface RecyclerDashboardClientProps {
  recycler: {
    id: string;
    name: string;
    registrationNumber: string;
    authorizationStatus: string;
    offeredRateMultiplier: number;
    location: string;
  };
  metrics: {
    pendingVerificationCount: number;
    verifiedCount: number;
    totalPayoutPending: number;
  };
  inboundQueue: Array<{
    id: string;
    lotId: string;
    materialCategory: string;
    weightKg: number;
    quotedValue: number;
    finalValue: number | null;
    paymentStatus: string;
    transactionStatus: string;
    createdAt: string;
    collectionLocation: string;
    collector: {
      name: string | null;
      phone: string;
      generalLocation: string;
    };
    traceability: {
      handoverReference: string;
      otpCode: string;
      timestampAtPickup: string;
      latitude: number;
      longitude: number;
    } | null;
  }>;
}

export function RecyclerDashboardClient({
  recycler,
  metrics,
  inboundQueue,
}: RecyclerDashboardClientProps) {
  return (
    <div className="flex flex-col flex-1 pb-4 bg-white">
      {/* Recycler Top Bar */}
      <RecyclerTopBar
        title={recycler.name}
        subtitle="Authorized Facility Inbound Processing"
        facilityName={recycler.name}
        registrationNumber={recycler.registrationNumber}
      />

      <div className="p-4 space-y-4 flex-1">
        {/* Facility Info Card */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <Factory className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 truncate max-w-[180px]">
                  {recycler.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold uppercase border border-emerald-200">
                  {recycler.authorizationStatus}
                </span>
                <span className="text-[10px] text-slate-500 truncate max-w-[140px]">
                  Rate: +{Math.round((recycler.offeredRateMultiplier - 1) * 100)}%
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/recycler/verify"
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition active:scale-95 shrink-0"
          >
            <ScanLine className="w-3.5 h-3.5" />
            <span>Intake</span>
          </Link>
        </div>

        {/* 1. Summary Cards */}
        <div className="grid grid-cols-3 gap-2">
          {/* Card 1: Lots pending verification */}
          <div className="p-3 rounded-2xl bg-white border border-slate-200 text-center shadow-sm">
            <span className="text-[10px] text-slate-500 block font-semibold leading-tight">
              Pending Intake
            </span>
            <p className="text-xl font-bold text-blue-700 mt-1">
              {metrics.pendingVerificationCount}
            </p>
            <span className="text-[9px] text-slate-400">Inbound lots</span>
          </div>

          {/* Card 2: Lots verified */}
          <div className="p-3 rounded-2xl bg-white border border-slate-200 text-center shadow-sm">
            <span className="text-[10px] text-slate-500 block font-semibold leading-tight">
              Verified Lots
            </span>
            <p className="text-xl font-bold text-emerald-600 mt-1">
              {metrics.verifiedCount}
            </p>
            <span className="text-[9px] text-emerald-700 font-medium">Logged</span>
          </div>

          {/* Card 3: Total payout pending */}
          <div className="p-3 rounded-2xl bg-white border border-slate-200 text-center shadow-sm">
            <span className="text-[10px] text-slate-500 block font-semibold leading-tight">
              Pending Payout
            </span>
            <p className="text-base font-bold text-slate-900 mt-1 truncate">
              ₹{metrics.totalPayoutPending.toLocaleString("en-IN")}
            </p>
            <span className="text-[9px] text-slate-400">Escrow liability</span>
          </div>
        </div>

        {/* Quick Scan Action Banner */}
        <Link
          href="/recycler/verify"
          className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50/70 to-blue-100/40 border border-blue-200 flex items-center justify-between group active:scale-[0.99] transition shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                Digital Weighbridge &amp; Intake Scanner
              </h3>
              <p className="text-[11px] text-slate-500">
                Scan QR or enter OTP to verify weight &amp; release payment
              </p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-transform shrink-0 ml-2 shadow-sm">
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        {/* Inbound Queue */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Inbound Processing Queue ({inboundQueue.length})
            </span>
            <span className="text-[11px] text-blue-600 font-medium">Auto-refreshing</span>
          </div>

          <div className="space-y-2.5">
            {inboundQueue.length > 0 ? (
              inboundQueue.map((lot) => {
                const isHandedOver = lot.transactionStatus === "HANDED_OVER";

                return (
                  <div
                    key={lot.id}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2.5 hover:border-blue-300 transition shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {lot.lotId}
                          </span>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              isHandedOver
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {isHandedOver ? "Ready for Intake" : "Awaiting Pickup"}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-800 mt-1">
                          {lot.materialCategory} • {lot.weightKg} kg
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          From {lot.collector.name || "Collector"} ({lot.collector.phone})
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-bold text-blue-700">
                          ₹{lot.quotedValue.toLocaleString("en-IN")}
                        </p>
                        <span className="text-[10px] text-slate-400 block">
                          Quoted Value
                        </span>
                      </div>
                    </div>

                    {lot.traceability && (
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-mono text-slate-600">
                          Ref: {lot.traceability.handoverReference}
                        </span>
                        <span className="font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-bold">
                          OTP: {lot.traceability.otpCode}
                        </span>
                      </div>
                    )}

                    <div className="pt-1 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 truncate max-w-[190px]">
                        <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                        {lot.collectionLocation}
                      </span>

                      <Link
                        href={`/recycler/verify?lotId=${lot.id}`}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm active:scale-95 shrink-0"
                      >
                        <span>Verify Lot</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                No lots currently pending verification.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
