"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CollectorTopBar } from "@/components/collector/CollectorTopBar";
import { useLanguage } from "@/context/LanguageContext";
import {
  Cpu,
  BatteryCharging,
  Cable,
  Tv,
  Zap,
  Boxes,
  Volume2,
  VolumeX,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export interface PriceBoardItem {
  id?: string;
  materialCategory: string;
  subCategory?: string | null;
  formalPricePerKg: number;
  informalPricePerKg: number;
  priceMin?: number | null;
  priceMax?: number | null;
  unit: string;
  previousFormalPricePerKg: number | null;
  previousInformalPricePerKg: number | null;
  diffAmount: number;
  diffPercent: number;
  trend: "UP" | "DOWN" | "STEADY";
  location: string;
  date?: string | Date;
}

const CATEGORY_META: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; nameKey: string; descKey: string }
> = {
  PCB: { icon: Cpu, nameKey: "cat_PCB", descKey: "cat_PCB_desc" },
  BATTERY: { icon: BatteryCharging, nameKey: "cat_BATTERY", descKey: "cat_BATTERY_desc" },
  CABLE: { icon: Cable, nameKey: "cat_CABLE", descKey: "cat_CABLE_desc" },
  CRT_LCD: { icon: Tv, nameKey: "cat_CRT_LCD", descKey: "cat_CRT_LCD_desc" },
  MOTOR_MAGNET: { icon: Zap, nameKey: "cat_MOTOR_MAGNET", descKey: "cat_MOTOR_MAGNET_desc" },
  MIXED_PLASTIC: { icon: Boxes, nameKey: "cat_MIXED_PLASTIC", descKey: "cat_MIXED_PLASTIC_desc" },
};

export function CollectorPriceBoardClient({
  prices,
}: {
  prices: PriceBoardItem[];
}) {
  const { t, language } = useLanguage();
  const [playingCategory, setPlayingCategory] = useState<string | null>(null);

  // Stop speech synthesis on component unmount or language change
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [language]);

  const handleToggleSpeak = (item: PriceBoardItem) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert(t("audioNotSupported"));
      return;
    }

    if (playingCategory === item.materialCategory) {
      window.speechSynthesis.cancel();
      setPlayingCategory(null);
      return;
    }

    window.speechSynthesis.cancel();

    const categoryLabel = t(
      (CATEGORY_META[item.materialCategory]?.nameKey || "cat_PCB") as any
    );
    const formal = item.formalPricePerKg;
    const informal = item.informalPricePerKg;
    const extra = formal - informal;
    const absDiff = Math.abs(item.diffAmount);

    let speechText = "";
    let langCode = "en-IN";

    if (language === "MR") {
      langCode = "mr-IN";
      const trendSentence =
        item.trend === "UP"
          ? `गेल्या आठवड्यापेक्षा दर ${absDiff} रुपयांनी वाढला आहे.`
          : item.trend === "DOWN"
          ? `गेल्या आठवड्यापेक्षा दर ${absDiff} रुपयांनी कमी झाला आहे.`
          : "दर गेल्या आठवड्यासारखा स्थिर आहे.";
      speechText = `${categoryLabel}. अधिकृत रिसायकलिंग दर ${formal} रुपये प्रति किलो आहे. स्थानिक कबाडीपेक्षा ${extra} रुपये जास्त मिळतील. ${trendSentence}`;
    } else if (language === "HI") {
      langCode = "hi-IN";
      const trendSentence =
        item.trend === "UP"
          ? `पिछले हफ्ते से भाव ${absDiff} रुपये बढ़ा है।`
          : item.trend === "DOWN"
          ? `पिछले हफ्ते से भाव ${absDiff} रुपये घटा है।`
          : "भाव पिछले हफ्ते जैसा स्थिर है।";
      speechText = `${categoryLabel}. अधिकृत रीसाइक्लिंग भाव ${formal} रुपये प्रति किलोग्राम है। स्थानीय कबाड़ी से ${extra} रुपये अधिक मिलेंगे। ${trendSentence}`;
    } else {
      langCode = "en-IN";
      const trendSentence =
        item.trend === "UP"
          ? `Price is up by ${absDiff} rupees per kilogram compared to last week.`
          : item.trend === "DOWN"
          ? `Price is down by ${absDiff} rupees per kilogram compared to last week.`
          : "Price is steady compared to last week.";
      speechText = `${categoryLabel}. Formal facility rate is ${formal} rupees per kilogram, which is ${extra} rupees higher than local scrap dealers. ${trendSentence}`;
    }

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = langCode;
    utterance.rate = 0.92; // Slightly measured rate for clear mobile field listening

    // Match best voice if available
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice =
      voices.find((v) => v.lang === langCode) ||
      voices.find((v) => v.lang.startsWith(langCode.slice(0, 2))) ||
      voices.find((v) => v.lang.includes("IN")) ||
      voices[0];

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      setPlayingCategory(item.materialCategory);
    };

    utterance.onend = () => {
      setPlayingCategory(null);
    };

    utterance.onerror = () => {
      setPlayingCategory(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col flex-1 pb-4 bg-white">
      <CollectorTopBar
        title={t("priceBoardTitle")}
        subtitle={t("priceBoardSubtitle")}
      />

      <div className="p-4 space-y-4 flex-1">
        {/* Top Highlight Card: Formal Premium */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white shadow-lg shadow-blue-600/20 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
              <Sparkles className="w-3 h-3 text-blue-200" />
              <span>{t("priceBoardBadge")}</span>
            </div>
            <span className="text-[10px] text-blue-200 font-medium">
              Delhi NCR Scrap Hub
            </span>
          </div>

          <div className="mt-3">
            <h3 className="text-base font-bold text-white leading-tight">
              {t("formalCardTitle")}
            </h3>
            <p className="text-xs text-blue-100 mt-1 leading-relaxed">
              {t("valueComparisonSubtitle")}
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between text-xs font-semibold text-white">
            <span className="flex items-center gap-1 text-emerald-300">
              <ShieldCheck className="w-4 h-4" />
              <span>CPCB Mandated Spreads</span>
            </span>
            <Link
              href="/collector/new-lot"
              className="px-3 py-1 rounded-lg bg-white text-blue-800 font-bold hover:bg-blue-50 transition active:scale-95 text-xs shadow-sm"
            >
              {t("startNewLotBtn")}
            </Link>
          </div>
        </div>

        {/* Categories List */}
        <div className="space-y-3">
          {prices.map((item) => {
            const meta = CATEGORY_META[item.materialCategory] || CATEGORY_META.PCB;
            const Icon = meta.icon;
            const isPlaying = playingCategory === item.materialCategory;
            const extraProfit = item.formalPricePerKg - item.informalPricePerKg;
            const percentGain =
              item.informalPricePerKg > 0
                ? Math.round(
                    ((item.formalPricePerKg - item.informalPricePerKg) /
                      item.informalPricePerKg) *
                      100
                  )
                : 0;

            return (
              <div
                key={item.materialCategory}
                className={`p-4 rounded-2xl border transition-all shadow-sm ${
                  isPlaying
                    ? "bg-blue-50/70 border-blue-600 shadow-md shadow-blue-500/15 ring-2 ring-blue-400/30"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* Header: Category Icon, Name, and Audio Listen Button */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        isPlaying
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        {t(meta.nameKey as any)}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {t(meta.descKey as any)}
                      </p>
                      {item.subCategory && (
                        <span className="inline-block text-[10px] font-semibold text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded border border-blue-200 mt-1">
                          {item.subCategory}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Audio Listen / Stop Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleSpeak(item)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shrink-0 ${
                      isPlaying
                        ? "bg-rose-600 text-white shadow-md shadow-rose-500/30 animate-pulse"
                        : "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 shadow-xs"
                    }`}
                    title={isPlaying ? t("stopListen") : t("listenBtn")}
                    aria-label={`Listen price for ${item.materialCategory}`}
                  >
                    {isPlaying ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>{t("stopListen")}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>{t("listenBtn")}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Rates Comparison & Trend Grid */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-3">
                  {/* Formal Rate */}
                  <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100">
                    <span className="text-[10px] text-blue-700 uppercase font-semibold block">
                      {t("formalRateLabel")}
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-2xl font-black text-blue-700">
                        ₹{item.formalPricePerKg}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">
                        {t("perKg")}
                      </span>
                    </div>
                    <span className="inline-block text-[10px] text-emerald-700 font-bold bg-emerald-100/70 px-1.5 py-0.5 rounded mt-1">
                      +{percentGain}% {t("extraBonusPerKg")}
                    </span>
                  </div>

                  {/* Informal Mandi Rate */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                      {t("informalRateLabel")}
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xl font-bold text-slate-400 line-through decoration-rose-500/70">
                        ₹{item.informalPricePerKg}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">
                        {t("perKg")}
                      </span>
                    </div>
                    <span className="inline-block text-[10px] text-rose-600 font-medium mt-1">
                      -₹{extraProfit}{t("perKg")} less
                    </span>
                  </div>
                </div>

                {/* Approximate Market Range Row */}
                {item.priceMin !== null &&
                  item.priceMin !== undefined &&
                  item.priceMax !== null &&
                  item.priceMax !== undefined && (
                    <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">Indicative Market Range:</span>
                      <span className="font-bold text-slate-800">
                        ₹{item.priceMin} – ₹{item.priceMax} <span className="font-normal text-slate-500">/ {item.unit}</span>
                      </span>
                    </div>
                  )}

                {/* Footer: Trend Indicator & Direct Action */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  {/* Trend Indicator derived from historical Price table rows */}
                  <div className="flex items-center gap-1.5 font-semibold">
                    {item.trend === "UP" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          +₹{item.diffAmount}{t("perKg")} ({item.diffPercent > 0 ? `+${item.diffPercent}%` : ""})
                        </span>
                        <span className="text-emerald-600 font-normal">
                          • {t("trendUp")}
                        </span>
                      </span>
                    ) : item.trend === "DOWN" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-bold">
                        <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
                        <span>
                          -₹{Math.abs(item.diffAmount)}{t("perKg")} ({item.diffPercent}%)
                        </span>
                        <span className="text-amber-600 font-normal">
                          • {t("trendDown")}
                        </span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 font-medium">
                        <Minus className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t("trendSteady")}</span>
                      </span>
                    )}
                  </div>

                  {/* Sell CTA */}
                  <Link
                    href="/collector/new-lot"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition group"
                  >
                    <span>{t("sellThisScrapBtn")}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
