"use client";

import React, { useState, useEffect } from "react";
import { CollectorTopBar } from "@/components/collector/CollectorTopBar";
import { useLanguage } from "@/context/LanguageContext";
import { QRCodeSVG } from "qrcode.react";
import {
  PackageCheck,
  Truck,
  QrCode,
  X,
  ChevronRight,
  WifiOff,
} from "lucide-react";
import { getPendingLots, syncPendingLots } from "@/lib/offline-store";

interface TransactionItem {
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
    location: string;
  } | null;
  traceability: {
    handoverReference: string;
    otpCode: string;
  } | null;
  isOfflinePending?: boolean;
}

export function CollectorLedgerClient({
  transactions,
}: {
  transactions: TransactionItem[];
}) {
  const { t, tStatus, tCategory, tPayment } = useLanguage();
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "PAID">("ALL");
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);
  const [offlineLots, setOfflineLots] = useState<TransactionItem[]>([]);

  const loadOffline = async () => {
    try {
      const pending = await getPendingLots();
      const mapped: TransactionItem[] = pending.map((l) => ({
        id: l.localId,
        lotId: l.tempLotId,
        materialCategory: l.materialCategory,
        weightKg: l.weightKg,
        quotedValue: l.quotedValue,
        finalValue: null,
        paymentStatus: "PENDING",
        transactionStatus: l.transactionStatus,
        createdAt: l.createdAt,
        recycler: {
          name: l.recyclerName,
          location: "Designated Recycler Depot",
        },
        traceability: {
          handoverReference: l.handoverReference,
          otpCode: l.otpCode,
        },
        isOfflinePending: true,
      }));
      setOfflineLots(mapped);
    } catch {
      // IndexedDB not ready
    }
  };

  useEffect(() => {
    loadOffline();
    // Also attempt a background sync if online
    syncPendingLots();

    const onSync = () => loadOffline();
    const onCreated = () => loadOffline();
    const onOnline = () => {
      syncPendingLots();
      loadOffline();
    };

    window.addEventListener("recyconnect:synced", onSync);
    window.addEventListener("recyconnect:offlinelot_created", onCreated);
    window.addEventListener("online", onOnline);

    return () => {
      window.removeEventListener("recyconnect:synced", onSync);
      window.removeEventListener("recyconnect:offlinelot_created", onCreated);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  const allLots = [...offlineLots, ...transactions];

  const filtered = allLots.filter((tx) => {
    if (filter === "PENDING") return tx.paymentStatus === "PENDING";
    if (filter === "PAID") return tx.paymentStatus === "PAID";
    return true;
  });

  const totalValue = allLots.reduce(
    (sum, t) => sum + (t.finalValue || t.quotedValue),
    0
  );
  const pendingValue = allLots
    .filter((t) => t.paymentStatus === "PENDING")
    .reduce((sum, t) => sum + (t.finalValue || t.quotedValue), 0);

  return (
    <div className="flex flex-col flex-1 pb-4 bg-white">
      <CollectorTopBar title={t("ledgerTitle")} subtitle={t("ledgerSubtitle")} />

      <div className="p-4 space-y-4 flex-1">
        {/* Ledger Summary Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">
              {t("totalVolume")}
            </span>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              ₹{totalValue.toLocaleString("en-IN")}
            </p>
            <span className="text-[11px] text-emerald-600 font-medium">
              {transactions.length} {t("totalLotsCount")}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200 shadow-sm">
            <span className="text-[10px] text-blue-700 uppercase font-semibold block">
              {t("ledgerShortcutTitle")}
            </span>
            <p className="text-xl font-bold text-blue-700 mt-0.5">
              ₹{pendingValue.toLocaleString("en-IN")}
            </p>
            <span className="text-[11px] text-blue-600">{t("awaitingPayout")}</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2">
          {(["ALL", "PENDING", "PAID"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                filter === status
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm font-bold"
                  : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
              }`}
            >
              {status === "ALL"
                ? t("filterAll")
                : status === "PENDING"
                ? t("filterPending")
                : t("filterPaid")}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        <div className="space-y-2.5">
          {filtered.length > 0 ? (
            filtered.map((tx) => {
              const displayAmount = tx.finalValue || tx.quotedValue;
              const isPaid = tx.paymentStatus === "PAID";
              const isCompleted = tx.transactionStatus === "COMPLETED";

              return (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 transition cursor-pointer active:scale-[0.99] space-y-2.5 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                        {isCompleted ? (
                          <PackageCheck className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Truck className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {tx.lotId}
                          </span>
                          {tx.isOfflinePending ? (
                            <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                              <WifiOff className="w-2.5 h-2.5" />
                              {t("pendingSyncBadge")}
                            </span>
                          ) : (
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                isCompleted
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-blue-50 text-blue-700 border border-blue-200"
                              }`}
                            >
                              {tStatus(tx.transactionStatus)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-medium text-slate-600 mt-0.5">
                          {tCategory(tx.materialCategory)} • {tx.weightKg} {t("weightUnit")}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-blue-700">
                        ₹{displayAmount.toLocaleString("en-IN")}
                      </p>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                          isPaid
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {tPayment(tx.paymentStatus)}
                      </span>
                    </div>
                  </div>

                  {/* Recycler & Traceability reference row */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate max-w-[200px]">
                      {tx.recycler?.name || t("pendingAssignment")}
                    </span>
                    <span className="text-blue-600 font-semibold flex items-center gap-0.5">
                      <QrCode className="w-3.5 h-3.5" />
                      <span>{t("viewCodeBtn")}</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
              {t("noFilteredTransactions")}
            </div>
          )}
        </div>
      </div>

      {/* Transaction Inspection Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-[360px] bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">
                  {t("handoverPassTitle")}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {t("lotIdLabel")} {selectedTx.lotId}
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

            {selectedTx.isOfflinePending && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2">
                <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{t("offlineCreatedNotice")}</span>
              </div>
            )}

            {/* QR Code */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center inline-block w-full">
              <div className="flex justify-center">
                <QRCodeSVG
                  value={
                    selectedTx.traceability?.handoverReference || selectedTx.lotId
                  }
                  size={160}
                  bgColor="#F8FAFC"
                  fgColor="#0F172A"
                  level="H"
                />
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between pb-1 border-b border-slate-100 text-slate-700">
                <span className="text-slate-500">{t("referenceLabel")}</span>
                <span className="font-mono font-bold text-blue-700">
                  {selectedTx.traceability?.handoverReference || "REF-OKH-DEFAULT"}
                </span>
              </div>
              <div className="flex justify-between pb-1 border-b border-slate-100 text-slate-700">
                <span className="text-slate-500">{t("fallbackOtpTitle")}</span>
                <span className="font-mono font-bold text-blue-700 tracking-widest text-sm">
                  {selectedTx.traceability?.otpCode || "4821"}
                </span>
              </div>
              <div className="flex justify-between pb-1 border-b border-slate-100 text-slate-700">
                <span className="text-slate-500">{t("designatedRecycler")}</span>
                <span className="font-medium text-slate-900 truncate max-w-[180px]">
                  {selectedTx.recycler?.name}
                </span>
              </div>
              <div className="flex justify-between pt-0.5 text-slate-700">
                <span className="text-slate-500">{t("quotedPayout")}</span>
                <span className="font-bold text-blue-700 text-sm">
                  ₹{(selectedTx.finalValue || selectedTx.quotedValue).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedTx(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 transition"
            >
              {t("closeBtn")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
