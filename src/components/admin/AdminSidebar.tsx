"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";
import {
  ShieldCheck,
  LayoutDashboard,
  Building2,
  TrendingUp,
} from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/admin/dashboard",
      label: "Overview",
      description: "Macro metrics & charts",
      icon: LayoutDashboard,
    },
    {
      href: "/admin/recyclers",
      label: "Recycler Directory",
      description: "Permits & authorizations",
      icon: Building2,
    },
    {
      href: "/admin/prices",
      label: "Prices",
      description: "Category rates & trends",
      icon: TrendingUp,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none text-white">
      <div>
        {/* Header */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-white text-base leading-none">
                RecyConnect
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold"
                    : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    isActive ? "text-white" : "text-slate-400"
                  }`}
                />
                <div>
                  <h4 className={`text-xs font-bold leading-tight ${
                    isActive ? "text-white" : "text-slate-300"
                  }`}>
                    {item.label}
                  </h4>
                  <p className={`text-[10px] mt-0.5 ${
                    isActive ? "text-blue-100" : "text-slate-400"
                  }`}>
                    {item.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-white block">
              Admin
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              admin@demo.com
            </span>
          </div>
        </div>

        <LogoutButton className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition active:scale-95 flex items-center justify-center gap-1.5" />
      </div>
    </aside>
  );
}
