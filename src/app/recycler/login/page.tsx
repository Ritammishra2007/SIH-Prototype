"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Factory, Mail, Lock, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";

export default function RecyclerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFillDemo = () => {
    setEmail("greenloop@demo.com");
    setPassword("demo1234");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in both email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/recycler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      router.push(data.redirectUrl || "/recycler/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-white">
      {/* Top Header */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition active:scale-95 shadow-sm"
          aria-label="Go back"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-base font-bold text-slate-900 leading-tight">
            Recycler Portal
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Authorized Disassembly & Refining Units</p>
        </div>
      </div>

      <div className="flex flex-col justify-between flex-1 p-5">
        <div>
          <div className="text-center py-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto mb-3">
              <Factory className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Recycler Sign In
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Access inbound lots, digital weighbridge &amp; chain-of-custody logs
            </p>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Authorized Facility Email
              </label>
              <div className="flex items-center rounded-xl bg-slate-50 border border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all px-3 py-3">
                <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="email"
                  placeholder="name@recycler.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none text-sm"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Portal Password
              </label>
              <div className="flex items-center rounded-xl bg-slate-50 border border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all px-3 py-3">
                <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Mandatory Demo placeholder notice per brief */}
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-center space-y-1.5">
              <p className="text-xs text-blue-800 font-medium">
                Demo login: greenloop@demo.com / demo1234
              </p>
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-[11px] px-3 py-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold transition active:scale-95 inline-flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Auto-fill demo credentials
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In as Recycler</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center pt-4 border-t border-slate-100 mt-6">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>DPCC &amp; CPCB Authorized Network Gateway</span>
          </p>
        </div>
      </div>
    </div>
  );
}
