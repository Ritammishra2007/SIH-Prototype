"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage, SUPPORTED_LANGUAGES, LanguageOption } from "@/context/LanguageContext";
import { Globe, Check, ChevronDown } from "lucide-react";
import { Language } from "@/lib/i18n/translations";

export function LanguageSelector({ className = "" }: { className?: string }) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentOption = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const handleSelect = (code: Language) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-semibold text-slate-800 transition active:scale-95 shadow-sm"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Select Language"
      >
        <Globe className="w-3.5 h-3.5 text-blue-600" />
        <span className="font-medium">{currentOption.native}</span>
        <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-36 rounded-xl bg-white border border-slate-200 shadow-xl py-1 z-50 animate-in fade-in-50 zoom-in-95">
          <div className="px-3 py-1 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Language
          </div>
          {SUPPORTED_LANGUAGES.map((opt: LanguageOption) => {
            const active = opt.code === language;
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => handleSelect(opt.code)}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition ${
                  active
                    ? "bg-blue-50 text-blue-700 font-bold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>{opt.native}</span>
                {active && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
