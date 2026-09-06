"use client";

import Link from "next/link";
import { PhoneShell } from "@/components/PhoneShell";
import { Scale, Factory, ShieldCheck, ArrowRight, Sparkles, RefreshCw } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/context/LanguageContext";

export default function RolePickerPage() {
  const { language } = useLanguage();

  // Clean localized role descriptions (Strictly single language at a time)
  const roleText = {
    EN: {
      tagline: "India's digital bridge formalizing informal scrap collectors with authorized recyclers under CPCB oversight.",
      collectorTitle: "I'm a Collector",
      collectorBadge: "Field Mobile App",
      collectorDesc: "Instant benchmark prices, QR handover & same-day direct payout",
      recyclerTitle: "I'm a Recycler",
      recyclerBadge: "Authorized Facility",
      recyclerDesc: "Weighbridge intake scanner, grading & digital chain-of-custody",
      adminTitle: "Admin Login",
      adminBadge: "CPCB Oversight",
      adminDesc: "National volume charts, facility permits & price surveillance",
    },
    HI: {
      tagline: "केंद्रीय प्रदूषण नियंत्रण बोर्ड (CPCB) के अंतर्गत अनौपचारिक कबाड़ियों को अधिकृत रीसाइक्लर्स से जोड़ने वाला डिजिटल मंच।",
      collectorTitle: "मैं एक कलेक्टर हूँ",
      collectorBadge: "कलेक्टर ऐप",
      collectorDesc: "तुरंत सही रेट, क्यूआर कोड से हैंडओवर और सीधा भुगतान",
      recyclerTitle: "मैं एक रीसाइक्लर हूँ",
      recyclerBadge: "अधिकृत केंद्र",
      recyclerDesc: "वजन सत्यापन, ग्रेडिंग और डिजिटल आपूर्ति श्रृंखला ऑडिट",
      adminTitle: "प्रशासक लॉगिन",
      adminBadge: "सरकारी निगरानी",
      adminDesc: "राष्ट्रीय ई-कचरा डेटा, रीसाइक्लर अनुमति और मूल्य निगरानी",
    },
    MR: {
      tagline: "केंद्रीय प्रदूषण नियंत्रण मंडळ (CPCB) अंतर्गत भंगार संकलकांना अधिकृत रिसायकलरशी जोडणारे डिजिटल व्यासपीठ.",
      collectorTitle: "मी एक संकलक आहे",
      collectorBadge: "संकलक ॲप",
      collectorDesc: "तात्काळ अचूक दर, क्यूआर कोड हस्तांतरण आणि थेट खात्यात रक्कम",
      recyclerTitle: "मी एक रिसायकलर आहे",
      recyclerBadge: "अधिकृत केंद्र",
      recyclerDesc: "वजन पडताळणी, ग्रेडिंग आणि डिजिटल पुरवठा साखळी ऑडिट",
      adminTitle: "प्रशासक लॉगिन",
      adminBadge: "शासकीय देखरेख",
      adminDesc: "राष्ट्रीय ई-कचरा आकडेवारी, रिसायकलर परवाने आणि दर देखरेख",
    },
  }[language] || {
    tagline: "India's digital bridge formalizing informal scrap collectors with authorized recyclers under CPCB oversight.",
    collectorTitle: "I'm a Collector",
    collectorBadge: "Field Mobile App",
    collectorDesc: "Instant benchmark prices, QR handover & same-day direct payout",
    recyclerTitle: "I'm a Recycler",
    recyclerBadge: "Authorized Facility",
    recyclerDesc: "Weighbridge intake scanner, grading & digital chain-of-custody",
    adminTitle: "Admin Login",
    adminBadge: "CPCB Oversight",
    adminDesc: "National volume charts, facility permits & price surveillance",
  };

  return (
    <PhoneShell badge="CPCB Verified">
      <div className="flex flex-col justify-between flex-1 py-1">
        {/* Top Bar with Language Selector */}
        <div className="flex items-center justify-between pb-2">
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[11px] text-blue-700 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>National Circularity Portal</span>
          </div>
          <LanguageSelector />
        </div>

        {/* App Title & Modern RecyConnect Emblem Logo */}
        <div className="text-center pt-2 pb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-blue-200 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/20">
            <RefreshCw className="w-8 h-8 text-white animate-[spin_16s_linear_infinite]" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            RecyConnect
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 max-w-[300px] mx-auto leading-relaxed">
            {roleText.tagline}
          </p>
        </div>

        {/* Three Role Cards */}
        <div className="space-y-3 my-auto">
          {/* 1. Collector Card */}
          <Link
            href="/collector/login"
            className="group block p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200 active:scale-[0.98] shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 p-2.5 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Scale className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                      {roleText.collectorBadge}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors mt-0.5">
                    {roleText.collectorTitle}
                  </h2>
                  <p className="text-xs text-slate-500 leading-snug">
                    {roleText.collectorDesc}
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-600 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-2">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* 2. Recycler Card */}
          <Link
            href="/recycler/login"
            className="group block p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-200 active:scale-[0.98] shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 p-2.5 shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Factory className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                      {roleText.recyclerBadge}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mt-0.5">
                    {roleText.recyclerTitle}
                  </h2>
                  <p className="text-xs text-slate-500 leading-snug">
                    {roleText.recyclerDesc}
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-emerald-600 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-2">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* 3. Admin Card */}
          <Link
            href="/admin/login"
            className="group block p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-lg hover:shadow-slate-500/10 transition-all duration-200 active:scale-[0.98] shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 p-2.5 shrink-0 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
                      {roleText.adminBadge}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 transition-colors mt-0.5">
                    {roleText.adminTitle}
                  </h2>
                  <p className="text-xs text-slate-500 leading-snug">
                    {roleText.adminDesc}
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-slate-800 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-2">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </div>

        {/* Footer info note */}
        <div className="text-center pt-3 pb-1">
          <p className="text-[11px] text-slate-400">
            Demonstration environment • Zero external APIs required
          </p>
        </div>
      </div>
    </PhoneShell>
  );
}
