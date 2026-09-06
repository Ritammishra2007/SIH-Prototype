"use client";

import React, { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      setIsOnline(navigator.onLine);
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="bg-rose-600 text-white px-3 py-1.5 text-xs flex items-center justify-center gap-2 border-b border-rose-700 font-medium select-none animate-pulse">
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>{t("offlineNotice")}</span>
    </div>
  );
}
