import React from "react";

interface PhoneShellProps {
  children: React.ReactNode;
  headerTitle?: string;
  headerSubtitle?: string;
  badge?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export function PhoneShell({
  children,
  headerTitle,
  headerSubtitle,
  badge,
  showBack,
  onBack,
}: PhoneShellProps) {
  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-center p-0 md:p-6 font-sans">
      <div className="w-full max-w-[430px] min-h-screen md:min-h-[844px] md:max-h-[890px] bg-white md:border md:border-slate-200 md:rounded-[32px] shadow-2xl shadow-slate-300/70 flex flex-col relative overflow-hidden text-slate-900">
        {/* Status Bar / Top notch simulation */}
        <div className="px-6 pt-3.5 pb-2 flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 bg-white select-none shrink-0">
          <div className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-blue-900 font-bold">RecyConnect</span>
          </div>
          {badge && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {badge}
            </span>
          )}
        </div>

        {/* Optional Header */}
        {(headerTitle || showBack) && (
          <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center gap-3 shrink-0">
            {showBack && (
              <button
                type="button"
                onClick={onBack || (() => window.history.back())}
                className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-blue-700 transition active:scale-95 shadow-sm"
                aria-label="Go back"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div className="truncate">
              {headerTitle && (
                <h1 className="text-base font-bold text-slate-900 leading-tight truncate">
                  {headerTitle}
                </h1>
              )}
              {headerSubtitle && (
                <p className="text-xs text-slate-500 mt-0.5 truncate">{headerSubtitle}</p>
              )}
            </div>
          </div>
        )}

        {/* Main scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col bg-white">
          {children}
        </div>
      </div>
    </div>
  );
}
