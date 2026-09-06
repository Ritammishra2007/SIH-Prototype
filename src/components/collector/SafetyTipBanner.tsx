"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ShieldAlert } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function SafetyTipBanner() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const { t } = useLanguage();

  const tips: Array<"safetyTip1" | "safetyTip2" | "safetyTip3" | "safetyTip4"> = [
    "safetyTip1",
    "safetyTip2",
    "safetyTip3",
    "safetyTip4",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % tips.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [tips.length]);

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev === 0 ? tips.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % tips.length);
  };

  return (
    <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 relative overflow-hidden transition-all duration-300 shadow-sm">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{t("safetyTipsHeading")}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrev}
            className="w-5 h-5 rounded flex items-center justify-center text-amber-800 hover:text-amber-950 bg-amber-100 hover:bg-amber-200/80 transition"
            aria-label="Previous tip"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-amber-800 font-mono font-semibold">
            {currentIdx + 1}/{tips.length}
          </span>
          <button
            type="button"
            onClick={handleNext}
            className="w-5 h-5 rounded flex items-center justify-center text-amber-800 hover:text-amber-950 bg-amber-100 hover:bg-amber-200/80 transition"
            aria-label="Next tip"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-700 leading-relaxed min-h-[38px] flex items-center font-normal">
        {t(tips[currentIdx])}
      </p>

      {/* Progress Dots */}
      <div className="flex justify-center gap-1.5 mt-2">
        {tips.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentIdx(idx)}
            className={`h-1 rounded-full transition-all duration-300 ${
              idx === currentIdx ? "w-5 bg-amber-600" : "w-1.5 bg-amber-200"
            }`}
            aria-label={`Go to tip ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
