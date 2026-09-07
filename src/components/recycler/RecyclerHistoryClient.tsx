"use client";

import React, { useState } from "react";
import { RecyclerTopBar } from "@/components/recycler/RecyclerTopBar";
import {
  PackageCheck,
  Scale,
  Search,
  X,
} from "lucide-react";

interface CompletedTransaction {
  id: string;
  lotId: string;
  materialCategory: string;
  weightKg: number;
  quotedValue: number;
  finalValue: number | null;
  paymentStatus: string;
  transactionStatus: string;
  createdAt: string;
  updatedAt: string;
  collector: {
    name: string | null;
    phone: string;
    generalLocation: string;
  };
  traceability: {
    handoverReference: string;
    recyclerConfirmedAt: string | null;
    timestampAtPickup: string;
  } | null;
}

export function RecyclerHistoryClient({
  initialHistory,
}: {
  initialHistory: CompletedTransaction[];
}) {
  const [filter, setFilter] = useState<"ALL" | "COMPLETED" | "VERIFIED">("ALL");
  const [categoryFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTx, setSelectedTx] = useState<CompletedTransaction | null>(null);

  const filtered = initialHistory.filter((t) => {
    // Status filter
    if (filter === "COMPLETED" && t.transactionStatus !== "COMPLETED") return false;
    if (filter === "VERIFIED" && t.transactionStatus !== "VERIFIED") return false;

    // Category filter
    if (categoryFilter !== "ALL" && t.materialCategory !== categoryFilter) return false;

    // Search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchLot = t.lotId.toLowerCase().includes(term);
      const matchCollector = (t.collector.name || "").toLowerCase().includes(term);
      const matchCat = t.materialCategory.toLowerCase().includes(term);
      return matchLot || matchCollector || matchCat;
    }

    return true;
  });

  const totalVolumeKg = initialHistory.reduce((sum, t) => sum + t.weightKg, 0);
  const totalSettledValue = initialHistory.reduce(
    (sum, t) => sum + (t.finalValue || t.quotedValue),
    0
  );

  return (
    <div className="flex flex-col flex-1 pb-4 bg-white">
      <RecyclerTopBar title="Facility Intake Ledger" subtitle="Completed chain-of-custody archive" />

      <div className="p-4 space-y-4 flex-1">
        {/* Cumulative Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">
              Total Weight Refined
            </span>
            <p className="text-xl font-bold text-emerald-600 mt-0.5">
              {totalVolumeKg.toFixed(1)} <span className="text-xs font-normal text-slate-500">kg</span>
            </p>
            <span className="text-[11px] text-slate-400">{initialHistory.length} Settled Lots</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200 shadow-sm">
            <span className="text-[10px] text-blue-700 uppercase font-semibold block">
              Disbursed Payouts
            </span>
            <p className="text-xl font-bold text-blue-700 mt-0.5">
              ₹{totalSettledValue.toLocaleString("en-IN")}
            </p>
            <span className="text-[11px] text-blue-600">100% Escrow Paid</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="space-y-2">
          <div className="flex items-center rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs focus-within:border-blue-600 transition">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search by lot ID, material, or collector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none text-xs"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {[
              { key: "ALL", label: "All Records" },
              { key: "COMPLETED", label: "Paid & Sealed" },
              { key: "VERIFIED", label: "Weighed & Verified" },
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition ${
                  filter === f.key
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm font-bold"
                    : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* History List */}
        <div className="space-y-2.5">
          {filtered.length > 0 ? (
            filtered.map((t) => {
              const amount = t.finalValue || t.quotedValue;
              const isCompleted = t.transactionStatus === "COMPLETED";

              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTx(t)}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 transition cursor-pointer active:scale-[0.99] space-y-2 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                        {isCompleted ? (
                          <PackageCheck className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Scale className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900">
                            {t.lotId}
                          </span>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              isCompleted
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {t.transactionStatus}
                          </span>
                        </div>
                        <h4 className="text-xs font-medium text-slate-800 mt-0.5">
                          {t.materialCategory} • {t.weightKg} kg
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Collector: {t.collector.name || "Field Collector"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-blue-700">
                        ₹{amount.toLocaleString("en-IN")}
                      </p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold uppercase">
                        {t.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      Ref: {t.traceability?.handoverReference || "REF-ARCHIVE"}
                    </span>
                    <span className="text-slate-500">
                      {new Date(t.updatedAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
              No transactions matching filter criteria.
            </div>
          )}
        </div>
      </div>

      {/* Audit Detail Inspection Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-[360px] bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Lot {selectedTx.lotId}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs shadow-sm">
              <div className="flex justify-between pb-1.5 border-b border-slate-200 text-slate-700">
                <span className="text-slate-500">Material Category</span>
                <span className="font-bold text-slate-900">{selectedTx.materialCategory}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-slate-200 text-slate-700">
                <span className="text-slate-500">Verified Net Weight</span>
                <span className="font-bold text-slate-900">{selectedTx.weightKg} kg</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-slate-200 text-slate-700">
                <span className="text-slate-500">Collector</span>
                <span className="text-slate-900">{selectedTx.collector.name} ({selectedTx.collector.phone})</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-slate-200 text-slate-700">
                <span className="text-slate-500">Handover Reference</span>
                <span className="font-mono font-bold text-blue-700">{selectedTx.traceability?.handoverReference}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-slate-200 text-slate-700">
                <span className="text-slate-500">Intake Confirmed At</span>
                <span className="font-mono text-slate-500">
                  {selectedTx.traceability?.recyclerConfirmedAt
                    ? new Date(selectedTx.traceability.recyclerConfirmedAt).toLocaleString("en-IN")
                    : "Intake Pending"}
                </span>
              </div>
              <div className="flex justify-between pt-1 text-slate-700">
                <span className="text-slate-500">Final Settled Amount</span>
                <span className="font-extrabold text-blue-700 text-base">
                  ₹{(selectedTx.finalValue || selectedTx.quotedValue).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedTx(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
