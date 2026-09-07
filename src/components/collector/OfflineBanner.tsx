"use client";

import React, { useState, useEffect } from "react";
import { WifiOff, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getPendingLots, syncPendingLots } from "@/lib/offline-store";

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [justSyncedCount, setJustSyncedCount] = useState<number | null>(null);
  const { t } = useLanguage();

  const refreshPendingCount = async () => {
    try {
      const pending = await getPendingLots();
      setPendingCount(pending.length);
    } catch {
      // IndexedDB not ready or error
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      setIsOnline(navigator.onLine);
      refreshPendingCount();
    }

    const handleOnline = async () => {
      setIsOnline(true);
      // Auto-sync as soon as connection is re-established
      const result = await syncPendingLots();
      if (result.syncedCount > 0) {
        setJustSyncedCount(result.syncedCount);
        setTimeout(() => setJustSyncedCount(null), 5000);
      }
      refreshPendingCount();
    };

    const handleOffline = () => {
      setIsOnline(false);
      refreshPendingCount();
    };

    const handleLotCreated = () => {
      refreshPendingCount();
    };

    const handleSynced = (e: any) => {
      refreshPendingCount();
      if (e.detail?.syncedCount > 0) {
        setJustSyncedCount(e.detail.syncedCount);
        setTimeout(() => setJustSyncedCount(null), 5000);
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("recyconnect:offlinelot_created", handleLotCreated);
    window.addEventListener("recyconnect:synced", handleSynced);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("recyconnect:offlinelot_created", handleLotCreated);
      window.removeEventListener("recyconnect:synced", handleSynced);
    };
  }, []);

  // Delight toast when lots were just uploaded upon reconnection
  if (justSyncedCount !== null && justSyncedCount > 0) {
    return (
      <div className="bg-emerald-600 text-white px-3 py-1.5 text-xs flex items-center justify-center gap-2 border-b border-emerald-700 font-semibold select-none animate-in fade-in slide-in-from-top duration-300">
        <CheckCircle2 className="w-4 h-4 text-emerald-100 shrink-0" />
        <span>
          ✓ {justSyncedCount} {t("syncedNotice")}
        </span>
      </div>
    );
  }

  if (isOnline) return null;

  return (
    <div className="bg-amber-600 text-white px-3 py-1.5 text-xs flex items-center justify-center gap-2 border-b border-amber-700 font-medium select-none animate-pulse">
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>
        {pendingCount > 0
          ? `${pendingCount} ${t("pendingLotsNotice")}`
          : t("offlineNotice")}
      </span>
    </div>
  );
}
