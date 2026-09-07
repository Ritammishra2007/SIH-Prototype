"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

/**
 * Illustrated Pictorial Hazard 1: Don't Burn Cables
 * Crossed-out flame over copper wire with smoke
 */
function NoBurningCablesIcon({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Background circle */}
      <circle cx="32" cy="32" r="30" fill="#FEF2F2" stroke="#FCA5A5" strokeWidth="1.5" />

      {/* Toxic black smoke */}
      <path
        d="M22 17C20 14 23 12 25 13C27 11 31 11 32 13C34 12 38 13 37 16C39 18 37 21 34 21C31 21 30 19 28 20C26 20 23 19 22 17Z"
        fill="#64748B"
        opacity="0.6"
      />
      <path
        d="M36 13C37 10 41 10 42 12C44 11 47 13 45 16C43 18 40 17 38 16C37 16 36 14 36 13Z"
        fill="#94A3B8"
        opacity="0.5"
      />

      {/* Flame */}
      <path
        d="M32 19C34 24 39 26 37 33C35 36 32 38 29 36C26 34 26 30 28 27C29 26 31 23 32 19Z"
        fill="#F59E0B"
      />
      <path
        d="M31 25C33 28 36 29 35 33C34 35 32 36 30 35C28 34 28 31 29 29C30 28 31 27 31 25Z"
        fill="#EF4444"
      />
      <path
        d="M31 30C32 32 34 32 33 35C32 36 31 36 30 35C29 34 29 33 30 32Z"
        fill="#FDE047"
      />

      {/* Cable Wire */}
      <rect x="14" y="38" width="36" height="7" rx="3.5" fill="#1E293B" />
      {/* Copper core exposed leads */}
      <path d="M48 41.5H54" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M10 41.5H16" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="23" y1="38" x2="23" y2="45" stroke="#475569" strokeWidth="1.5" />
      <line x1="31" y1="38" x2="31" y2="45" stroke="#475569" strokeWidth="1.5" />
      <line x1="39" y1="38" x2="39" y2="45" stroke="#475569" strokeWidth="1.5" />

      {/* Prohibition Red Circle & Slash */}
      <circle cx="32" cy="32" r="25" stroke="#DC2626" strokeWidth="4" fill="none" />
      <line x1="14.5" y1="14.5" x2="49.5" y2="49.5" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Illustrated Pictorial Hazard 2: Don't Open Batteries by Hand
 * Hammer / pry tool cracking battery with acid splash, crossed out
 */
function NoBatteryPryIcon({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Background circle */}
      <circle cx="32" cy="32" r="30" fill="#FEF2F2" stroke="#FCA5A5" strokeWidth="1.5" />

      {/* Battery body */}
      <rect x="22" y="23" width="20" height="26" rx="3" fill="#334155" />
      <rect x="28" y="19" width="8" height="4" rx="1.5" fill="#94A3B8" />
      {/* Terminals +/- */}
      <path d="M32 26V30M30 28H34" stroke="#F8FAFC" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M30 43H34" stroke="#F8FAFC" strokeWidth="1.8" strokeLinecap="round" />

      {/* Prying Chisel/Hammer smashing down */}
      <path d="M16 16L24 24M22 14L28 20" stroke="#64748B" strokeWidth="3.5" strokeLinecap="round" />

      {/* Battery rupture crack */}
      <path d="M32 23L30 30L34 34L31 42" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" />

      {/* Acid drops */}
      <circle cx="43" cy="35" r="2.5" fill="#84CC16" />
      <circle cx="45" cy="42" r="2" fill="#84CC16" />

      {/* Prohibition Red Circle & Slash */}
      <circle cx="32" cy="32" r="25" stroke="#DC2626" strokeWidth="4" fill="none" />
      <line x1="14.5" y1="14.5" x2="49.5" y2="49.5" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Illustrated Pictorial Hazard 3: Wear Protective Heavy Work Gloves
 * Heavy work gauntlet handling sharp CRT glass / scrap with mandatory checkmark
 */
function WearGlovesIcon({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Background circle */}
      <circle cx="32" cy="32" r="30" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1.5" />

      {/* Sharp jagged shattered glass pieces */}
      <polygon points="14,24 24,16 22,28" fill="#93C5FD" opacity="0.8" stroke="#3B82F6" strokeWidth="1" />
      <polygon points="46,20 54,26 44,32" fill="#93C5FD" opacity="0.8" stroke="#3B82F6" strokeWidth="1" />
      <polygon points="42,38 52,42 45,48" fill="#60A5FA" opacity="0.6" stroke="#2563EB" strokeWidth="1" />

      {/* Heavy Work Glove */}
      <path
        d="M22 42C22 41 24 40 27 40H37C40 40 42 41 42 42V48C42 49 40 50 37 50H27C24 50 22 49 22 48V42Z"
        fill="#1D4ED8"
      />
      {/* Fingers */}
      <path
        d="M25 40V28C25 26.5 27 26.5 27 28V36M28 28V23C28 21.5 30.5 21.5 30.5 23V34M31.5 24V21C31.5 19.5 34 19.5 34 21V34M35 25V23C35 21.5 37.5 21.5 37.5 23V37C37.5 39 37 40 37 40H25Z"
        fill="#3B82F6"
        stroke="#1E40AF"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Thumb */}
      <path d="M25 36C22 36 19 33 21 30C22 28 24 29 25 32V36Z" fill="#60A5FA" stroke="#1E40AF" strokeWidth="1.2" />

      {/* Mandatory Blue Ring & Checkmark */}
      <circle cx="32" cy="32" r="26" stroke="#2563EB" strokeWidth="3" fill="none" strokeDasharray="5 3" />
      <circle cx="48" cy="16" r="9" fill="#10B981" />
      <path d="M44 16L47 19L52 13" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Illustrated Pictorial Hazard 4: Keep Lithium Batteries Dry & Shaded
 * Battery with water splash and raindrops crossed out
 */
function KeepBatteryDryIcon({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Background circle */}
      <circle cx="32" cy="32" r="30" fill="#FEF2F2" stroke="#FCA5A5" strokeWidth="1.5" />

      {/* Battery Pack */}
      <rect x="20" y="28" width="24" height="18" rx="3" fill="#1E293B" />
      <rect x="24" y="25" width="4" height="3" rx="1" fill="#94A3B8" />
      <rect x="36" y="25" width="4" height="3" rx="1" fill="#94A3B8" />
      <text x="23" y="40" fill="#F8FAFC" fontSize="7" fontWeight="bold" fontFamily="sans-serif">Li-ion</text>

      {/* Falling Raindrops */}
      <path d="M26 15C26 15 23 19 23 21C23 22.5 24.5 24 26 24C27.5 24 29 22.5 29 21C29 19 26 15 26 15Z" fill="#0284C7" />
      <path d="M37 17C37 17 35 20 35 21.5C35 22.5 36 23.5 37 23.5C38 23.5 39 22.5 39 21.5C39 20 37 17 37 17Z" fill="#38BDF8" />

      {/* Splash arcs */}
      <path d="M17 33C15 31 14 29 14 29" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
      <path d="M47 33C49 31 50 29 50 29" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />

      {/* Prohibition Red Circle & Slash over Water */}
      <circle cx="32" cy="32" r="25" stroke="#DC2626" strokeWidth="4" fill="none" />
      <line x1="14.5" y1="14.5" x2="49.5" y2="49.5" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

interface SafetyItem {
  icon: React.ComponentType<{ className?: string }>;
  titleKey: "safetyTipTitle1" | "safetyTipTitle2" | "safetyTipTitle3" | "safetyTipTitle4";
  textKey: "safetyTip1" | "safetyTip2" | "safetyTip3" | "safetyTip4";
  badgeColor: string;
}

const SAFETY_ITEMS: SafetyItem[] = [
  {
    icon: NoBurningCablesIcon,
    titleKey: "safetyTipTitle1",
    textKey: "safetyTip1",
    badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
  },
  {
    icon: NoBatteryPryIcon,
    titleKey: "safetyTipTitle2",
    textKey: "safetyTip2",
    badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
  },
  {
    icon: WearGlovesIcon,
    titleKey: "safetyTipTitle3",
    textKey: "safetyTip3",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    icon: KeepBatteryDryIcon,
    titleKey: "safetyTipTitle4",
    textKey: "safetyTip4",
    badgeColor: "bg-sky-100 text-sky-800 border-sky-200",
  },
];

export function SafetyTipBanner() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % SAFETY_ITEMS.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev === 0 ? SAFETY_ITEMS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % SAFETY_ITEMS.length);
  };

  const currentItem = SAFETY_ITEMS[currentIdx];
  const GraphicComponent = currentItem.icon;

  return (
    <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 relative overflow-hidden transition-all duration-300 shadow-sm">
      {/* Top Header Row with Heading & Nav Buttons */}
      <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-amber-200/60">
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
          {t("safetyTipsHeading")}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrev}
            className="w-5 h-5 rounded flex items-center justify-center text-amber-800 hover:text-amber-950 bg-amber-100 hover:bg-amber-200/80 transition active:scale-95"
            aria-label="Previous hazard warning"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-amber-800 font-mono font-bold px-1">
            {currentIdx + 1}/{SAFETY_ITEMS.length}
          </span>
          <button
            type="button"
            onClick={handleNext}
            className="w-5 h-5 rounded flex items-center justify-center text-amber-800 hover:text-amber-950 bg-amber-100 hover:bg-amber-200/80 transition active:scale-95"
            aria-label="Next hazard warning"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Illustrated Pictorial Hazard & Explanation */}
      <div className="flex items-center gap-3.5">
        {/* Large Pictorial Hazard Illustration */}
        <div className="shrink-0 drop-shadow-sm">
          <GraphicComponent className="w-14 h-14 transition-transform duration-300 hover:scale-105" />
        </div>

        {/* Text Details: Bold Hazard Title & Guidance */}
        <div className="space-y-1 flex-1 min-w-0">
          <span
            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${currentItem.badgeColor}`}
          >
            {t(currentItem.titleKey)}
          </span>
          <p className="text-xs text-slate-700 leading-relaxed font-normal line-clamp-2">
            {t(currentItem.textKey)}
          </p>
        </div>
      </div>

      {/* Clickable Progress Dots */}
      <div className="flex justify-center gap-1.5 mt-2.5 pt-1.5 border-t border-amber-200/40">
        {SAFETY_ITEMS.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentIdx(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIdx ? "w-6 bg-amber-600" : "w-1.5 bg-amber-200 hover:bg-amber-300"
            }`}
            aria-label={`Go to hazard ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
