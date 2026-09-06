import React from "react";
import { RecyclerNav } from "@/components/recycler/RecyclerNav";

export default function RecyclerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-center p-0 md:p-6 font-sans">
      <div className="w-full max-w-[430px] min-h-screen md:min-h-[844px] md:max-h-[890px] bg-white md:border md:border-slate-200 md:rounded-[32px] shadow-2xl shadow-slate-300/70 flex flex-col relative overflow-hidden text-slate-900">
        <div className="flex-1 overflow-y-auto flex flex-col bg-white">
          {children}
        </div>
        <RecyclerNav />
      </div>
    </div>
  );
}
