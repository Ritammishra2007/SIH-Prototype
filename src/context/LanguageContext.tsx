"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, Language } from "@/lib/i18n/translations";

export type TranslationKey = keyof typeof translations.EN;

export interface LanguageOption {
  code: Language;
  label: string;
  native: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "EN", label: "English", native: "English" },
  { code: "HI", label: "Hindi", native: "हिन्दी" },
  { code: "MR", label: "Marathi", native: "मराठी" },
];

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  cycleLanguage: () => void;
  t: (key: TranslationKey) => string;
  languages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
  children,
  initialLanguage = "EN",
}: {
  children: React.ReactNode;
  initialLanguage?: Language;
}) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  useEffect(() => {
    // Read saved language from localStorage if available
    const saved = localStorage.getItem("recyconnect_lang") as Language;
    if (saved === "EN" || saved === "HI" || saved === "MR") {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("recyconnect_lang", lang);
    }
    // Sync with server in background if authenticated
    fetch("/api/collector/language", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: lang }),
    }).catch(() => {
      // Ignore network failures gracefully
    });
  };

  const cycleLanguage = () => {
    const order: Language[] = ["EN", "HI", "MR"];
    const currentIndex = order.indexOf(language);
    const nextIndex = (currentIndex + 1) % order.length;
    setLanguage(order[nextIndex]);
  };

  const t = (key: TranslationKey): string => {
    const dict = translations[language] || translations.EN;
    return (dict as any)[key] || (translations.EN as any)[key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        cycleLanguage,
        t,
        languages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
