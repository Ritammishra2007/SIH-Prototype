"use client";

import Link from "next/link";
import { PhoneShell } from "@/components/PhoneShell";
import { Scale, Factory, ShieldCheck, ArrowRight, RefreshCw } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/context/LanguageContext";

export default function RolePickerPage() {
  const { language, t } = useLanguage();

  const roleText = {
    EN: {
      collectorTitle: "Collector",
      recyclerTitle: "Recycler",
      adminTitle: "Admin",
    },
    HI: {
      collectorTitle: "कलेक्टर",
      recyclerTitle: "रीसाइक्लर",
      adminTitle: "प्रशासक",
    },
    MR: {
      collectorTitle: "संकलक",
      recyclerTitle: "रिसायकलर",
      adminTitle: "प्रशासक",
    },
  }[language] || {
    collectorTitle: "Collector",
    recyclerTitle: "Recycler",
    adminTitle: "Admin",
  };

  return (
    <PhoneShell>
      <div className="flex flex-col justify-between flex-1 py-1">
        {/* Top Bar with Language Selector */}
        <div className="flex items-center justify-end pb-2">
          <LanguageSelector />
        </div>

        {/* App Title & Logo */}
        <div className="text-center pt-2 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-blue-200 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/20">
            <RefreshCw className="w-8 h-8 text-white animate-[spin_16s_linear_infinite]" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            RecyConnect
          </h1>
        </div>

        {/* Three Plain Role Cards */}
        <div className="space-y-3 my-auto">
          {/* 1. Collector Card */}
          <Link
            href="/collector/login"
            className="group block p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all duration-200 active:scale-[0.98] shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 p-2.5 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Scale className="w-6 h-6" />
                </div>
                <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                  {roleText.collectorTitle}
                </h2>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-600 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-2">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* 2. Recycler Card */}
          <Link
            href="/recycler/login"
            className="group block p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all duration-200 active:scale-[0.98] shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 p-2.5 shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Factory className="w-6 h-6" />
                </div>
                <h2 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {roleText.recyclerTitle}
                </h2>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-emerald-600 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-2">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* 3. Admin Card */}
          <Link
            href="/admin/login"
            className="group block p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all duration-200 active:scale-[0.98] shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 p-2.5 shrink-0 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-base font-bold text-slate-900 transition-colors">
                  {roleText.adminTitle}
                </h2>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-slate-800 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-2">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </div>

      </div>
    </PhoneShell>
  );
}
