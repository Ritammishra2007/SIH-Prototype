"use client";

import React from "react";
import { CollectorTopBar } from "@/components/collector/CollectorTopBar";
import { LogoutButton } from "@/components/LogoutButton";
import { useLanguage } from "@/context/LanguageContext";
import {
  Phone,
  MapPin,
  Globe,
  Leaf,
} from "lucide-react";
import { Language } from "@/lib/i18n/translations";

interface CollectorProfileClientProps {
  collector: {
    id: string;
    name: string | null;
    phone: string;
    generalLocation: string;
    preferredLanguage: string;
  } | null;
  totalKg: number;
  totalLots: number;
}

export function CollectorProfileClient({
  collector,
  totalKg,
  totalLots,
}: CollectorProfileClientProps) {
  const { t, language, setLanguage } = useLanguage();

  const leadDivertedKg = Math.round(totalKg * 0.15 * 10) / 10;
  const co2SavedKg = Math.round(totalKg * 1.4);

  const langOptions: { code: Language; label: string }[] = [
    { code: "EN", label: "English" },
    { code: "HI", label: "हिन्दी" },
    { code: "MR", label: "मराठी" },
  ];

  return (
    <div className="flex flex-col flex-1 pb-4 bg-white">
      <CollectorTopBar title={t("profileTitle")} />

      <div className="p-4 space-y-4 flex-1">
        {/* Profile Identity Card */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-2xl">
              {collector?.name ? collector.name[0] : "C"}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold text-slate-900">
                  {collector?.name || t("defaultCollectorName")}
                </h3>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  {t("registeredBadge")}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                <Phone className="w-3 h-3 text-blue-600" />
                <span>{collector?.phone}</span>
              </p>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                <span>{collector?.generalLocation || "Delhi NCR Scrap Hub"}</span>
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-500">
            <span>{t("collectorId")}</span>
            <span className="font-mono text-slate-800 font-medium">{collector?.id.slice(-8)}</span>
          </div>
        </div>

        {/* Language Preference Section (3-Way Choice: English, हिन्दी, मराठी) */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-900">
                {t("languageSetting")}
              </span>
            </div>
            <span className="text-[11px] text-blue-700 font-semibold">
              {language === "EN" ? "English" : language === "HI" ? "हिन्दी" : "मराठी"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            {langOptions.map((opt) => {
              const active = language === opt.code;
              return (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => setLanguage(opt.code)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border transition text-center ${
                    active
                      ? "bg-blue-600 text-white border-blue-600 font-bold shadow-md shadow-blue-500/20"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sustainability & Environmental Impact Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-emerald-100/30 border border-emerald-200 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-800">
            <Leaf className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
              {t("environmentalImpactTitle")}
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="p-3 rounded-xl bg-white border border-emerald-200 shadow-sm">
              <span className="text-[10px] text-slate-500 block">
                {t("toxicLeadPrevented")}
              </span>
              <p className="text-lg font-bold text-emerald-700 mt-0.5">
                {leadDivertedKg} <span className="text-xs font-normal">kg</span>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-emerald-200 shadow-sm">
              <span className="text-[10px] text-slate-500 block">
                {t("co2EmissionsSaved")}
              </span>
              <p className="text-lg font-bold text-blue-700 mt-0.5">
                {co2SavedKg} <span className="text-xs font-normal">kg</span>
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-100/60 border border-emerald-200 flex items-center justify-between text-[11px] text-emerald-900 font-medium">
            <span>{t("totalFormalizedScrap")}</span>
            <span className="font-bold text-slate-900">{totalKg.toFixed(1)} {t("weightUnit")} ({totalLots} {t("totalLotsCount")})</span>
          </div>
        </div>

        {/* App Version & Logout Button */}
        <div className="pt-2">
          <div className="flex justify-center">
            <LogoutButton className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 text-xs font-bold border border-slate-200 hover:border-rose-200 transition active:scale-95 flex items-center justify-center gap-2" />
          </div>
        </div>
      </div>
    </div>
  );
}
