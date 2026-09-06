"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Building2,
  PackageCheck,
  Scale,
  IndianRupee,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

interface AdminOverviewProps {
  metrics: {
    totalRecyclersCount: number;
    authorizedRecyclersCount: number;
    pendingRecyclersCount: number;
    revokedRecyclersCount: number;
    totalLotsCount: number;
    totalDivertedWeightKg: number;
    totalFormalPayout: number;
  };
  volumeByCategory: Array<{
    category: string;
    totalKg: number;
    completedKg: number;
    lotsCount: number;
    totalValue: number;
  }>;
  recentActivity: Array<{
    id: string;
    lotId: string;
    materialCategory: string;
    weightKg: number;
    quotedValue: number;
    finalValue: number | null;
    paymentStatus: string;
    transactionStatus: string;
    createdAt: string;
    collectorName: string;
    recyclerName: string;
  }>;
}

export function AdminOverviewClient({
  metrics,
  volumeByCategory,
  recentActivity,
}: AdminOverviewProps) {
  // Custom tooltip for clean light Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xl text-xs space-y-1">
          <p className="font-bold text-slate-900 border-b border-slate-100 pb-1">{label}</p>
          <p className="text-slate-600 flex items-center justify-between gap-3">
            <span>Total Logged:</span>
            <span className="font-mono font-bold text-slate-800">{payload[0]?.value} kg</span>
          </p>
          <p className="text-blue-700 flex items-center justify-between gap-3">
            <span>Diverted (Completed):</span>
            <span className="font-mono font-bold">{payload[1]?.value} kg</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">
              National E-Waste Formalization Dashboard
            </h1>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold uppercase border border-blue-200">
              LIVE SURVEILLANCE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Central Pollution Control Board (CPCB) • Delhi NCR Pilot Region
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/recyclers"
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition shadow-sm"
          >
            Review Recycler Permits
          </Link>
          <Link
            href="/admin/prices"
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold transition shadow-md shadow-blue-500/20"
          >
            Surveillance Rates
          </Link>
        </div>
      </div>

      {/* 1. TOP-LINE STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Registered Recyclers */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Recycler Facilities
            </span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {metrics.totalRecyclersCount}
            </span>
            <span className="text-xs text-emerald-600 font-medium">
              {metrics.authorizedRecyclersCount} Authorized
            </span>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-blue-700 font-medium">
              {metrics.pendingRecyclersCount} Pending Verification
            </span>
            {metrics.pendingRecyclersCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            )}
          </div>
        </div>

        {/* Card 2: Total Lots Processed */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Lots Processed
            </span>
            <PackageCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {metrics.totalLotsCount}
            </span>
            <span className="text-xs text-slate-500">Tracked Lots</span>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>EPR Digital Ledger</span>
            <span className="text-emerald-600 font-medium">100% Traceable</span>
          </div>
        </div>

        {/* Card 3: Diverted Weight */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/60 to-blue-100/30 border border-blue-200 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-blue-700">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Weight Diverted
            </span>
            <Scale className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-700">
              {metrics.totalDivertedWeightKg.toFixed(1)}
            </span>
            <span className="text-sm font-bold text-slate-500">kg</span>
          </div>
          <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between text-[11px] text-slate-600">
            <span className="text-blue-700 font-semibold">Informal $\to$ Formal Channel</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
              VERIFIED
            </span>
          </div>
        </div>

        {/* Card 4: Formal Disbursed Payout */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Formal Payout
            </span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-blue-700">
              ₹{metrics.totalFormalPayout.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Direct to Collectors</span>
            <span className="text-emerald-600 font-semibold">+44% vs Mandi</span>
          </div>
        </div>
      </div>

      {/* 2. RECHARTS TRANSACTION VOLUME BY MATERIAL CATEGORY */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Transaction Volume by Material Category (kg)
            </h3>
            <p className="text-xs text-slate-500">
              Comparison between total scrap weight logged and sealed/completed formal intake
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className="w-3 h-3 rounded-sm bg-blue-300" />
              Total Logged Volume (kg)
            </span>
            <span className="flex items-center gap-1.5 text-blue-700 font-medium">
              <span className="w-3 h-3 rounded-sm bg-blue-600" />
              Diverted Formal (kg)
            </span>
          </div>
        </div>

        {/* Responsive Recharts Container */}
        <div className="h-[280px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volumeByCategory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis
                dataKey="category"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#E2E8F0" }}
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#E2E8F0" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="totalKg" name="Total Logged" fill="#93C5FD" radius={[4, 4, 0, 0]} barSize={22} />
              <Bar dataKey="completedKg" name="Diverted Formal" fill="#1D4ED8" radius={[4, 4, 0, 0]} barSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. RECENT NATIONAL AUDIT LEDGER */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              National Chain-of-Custody Feed
            </h3>
            <p className="text-xs text-slate-500">
              Live transaction intake events across authorized recycling hubs
            </p>
          </div>
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Immutable Traceability</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">Lot ID</th>
                <th className="py-2.5 px-3">Material</th>
                <th className="py-2.5 px-3">Net Weight</th>
                <th className="py-2.5 px-3">Collector</th>
                <th className="py-2.5 px-3">Assigned Recycler</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {recentActivity.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                    {tx.lotId}
                  </td>
                  <td className="py-2.5 px-3 font-medium">
                    {tx.materialCategory}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">
                    {tx.weightKg} kg
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">
                    {tx.collectorName}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 truncate max-w-[160px]">
                    {tx.recyclerName}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        tx.transactionStatus === "COMPLETED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : tx.transactionStatus === "HANDED_OVER"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {tx.transactionStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-blue-700">
                    ₹{(tx.finalValue || tx.quotedValue).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
