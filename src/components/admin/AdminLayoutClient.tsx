"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ShieldCheck, Menu, X } from "lucide-react";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If on admin login, render standalone
  if (pathname === "/admin/login") {
    return <div className="min-h-screen bg-slate-100">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <span className="font-bold text-slate-900">CPCB Oversight</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex">
          <div className="w-72 bg-slate-900 h-full flex flex-col">
            <AdminSidebar />
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Desktop Left Sidebar */}
      <div className="hidden md:flex min-h-screen sticky top-0 h-screen">
        <AdminSidebar />
      </div>

      {/* Main Content Workspace */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-screen bg-slate-50">
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Central Pollution Control Board • Ministry of Environment, Forest and Climate Change
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-semibold">
              E-Waste (Management) Rules Surveillance
            </span>
          </div>
        </header>

        {/* Inner Content Area */}
        <div className="p-4 md:p-8 max-w-6xl w-full mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
