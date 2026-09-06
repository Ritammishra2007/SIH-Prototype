"use client";

import React from "react";
import { LogoutButton } from "@/components/LogoutButton";
import { ArrowLeft } from "lucide-react";

interface RecyclerTopBarProps {
  title?: string;
  subtitle?: string;
  facilityName?: string;
  registrationNumber?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export function RecyclerTopBar({
  title,
  subtitle,
  facilityName,
  registrationNumber,
  showBack,
  onBack,
}: RecyclerTopBarProps) {
  return (
    <div className="bg-white border-b border-slate-200 shrink-0 select-none">
      {/* Notch / Mini Status Bar */}
      <div className="px-5 pt-3.5 pb-2 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <span className="font-bold text-slate-900">RecyConnect</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-100">
            RECYCLER
          </span>
        </div>

        <div className="flex items-center gap-2">
          {registrationNumber && (
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {registrationNumber}
            </span>
          )}
          <LogoutButton />
        </div>
      </div>

      {/* Screen Title Bar */}
      {(title || showBack) && (
        <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3 truncate">
            {showBack && (
              <button
                type="button"
                onClick={onBack || (() => window.history.back())}
                className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-blue-700 transition active:scale-95 shrink-0 shadow-sm"
                aria-label="Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="truncate">
              {title && (
                <h1 className="text-base font-bold text-slate-900 leading-tight truncate">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">{subtitle}</p>
              )}
            </div>
          </div>

          {facilityName && (
            <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full shrink-0 ml-2">
              Authorized
            </span>
          )}
        </div>
      )}
    </div>
  );
}
