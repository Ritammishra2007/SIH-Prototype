import React from "react";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { LanguageProvider } from "@/context/LanguageContext";
import { OfflineBanner } from "@/components/collector/OfflineBanner";
import { CollectorNav } from "@/components/collector/CollectorNav";
import { Language } from "@/lib/i18n/translations";

export default async function CollectorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  let initialLanguage: Language = "EN";

  if (session?.userId && session.role === "COLLECTOR") {
    const collector = await prisma.collector.findUnique({
      where: { id: session.userId },
      select: { preferredLanguage: true },
    });
    if (collector?.preferredLanguage === "HI" || collector?.preferredLanguage === "MR") {
      initialLanguage = collector.preferredLanguage as Language;
    }
  }

  return (
    <LanguageProvider initialLanguage={initialLanguage}>
      <div className="min-h-screen bg-slate-100 flex justify-center items-center p-0 md:p-6 font-sans">
        <div className="w-full max-w-[430px] min-h-screen md:min-h-[844px] md:max-h-[890px] bg-white md:border md:border-slate-200 md:rounded-[32px] shadow-2xl shadow-slate-300/70 flex flex-col relative overflow-hidden text-slate-900">
          <OfflineBanner />
          <div className="flex-1 overflow-y-auto flex flex-col bg-white">
            {children}
          </div>
          <CollectorNav />
        </div>
      </div>
    </LanguageProvider>
  );
}
