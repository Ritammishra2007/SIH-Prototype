"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, KeyRound, ArrowRight, AlertCircle } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/context/LanguageContext";

export default function CollectorLoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    setStep("OTP");
  };

  const handleOtpChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-focus next input
    if (digit && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    const otpCode = otp.join("");
    if (otpCode.length < 4) {
      setError("Please enter all 4 digits of the OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/collector", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp: otpCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      router.push(data.redirectUrl || "/collector/home");
    } catch (err: any) {
      setError(err.message || "Invalid OTP. Use 4912.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-white">
      {/* Top Header */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (step === "OTP") {
                setStep("PHONE");
              } else {
                router.push("/");
              }
            }}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition active:scale-95 shadow-sm"
            aria-label="Go back"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">
              {t("loginTitle")}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">{t("loginSubtitle")}</p>
          </div>
        </div>

        <LanguageSelector />
      </div>

      <div className="flex flex-col justify-between flex-1 p-5">
        <div>
          {/* Progress Indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div
              className={`h-1.5 flex-1 rounded-full ${
                step === "PHONE" || step === "OTP" ? "bg-blue-600" : "bg-slate-200"
              }`}
            />
            <div
              className={`h-1.5 flex-1 rounded-full ${
                step === "OTP" ? "bg-blue-600" : "bg-slate-200"
              }`}
            />
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === "PHONE" ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="text-center py-2">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto mb-3">
                  <Phone className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  {t("enterPhone")}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {t("enterPhoneSubtitle")}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t("phoneLabel")}
                </label>
                <div className="flex rounded-xl overflow-hidden bg-slate-50 border border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  <span className="inline-flex items-center px-3.5 bg-slate-100 text-slate-700 text-sm font-semibold select-none border-r border-slate-200">
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-transparent px-3 py-3 text-slate-900 placeholder-slate-400 focus:outline-none text-base tracking-wide"
                    autoFocus
                  />
                </div>
              </div>

              {/* Demo auto-fill chips */}
              <div className="pt-1">
                <p className="text-[11px] text-slate-500 mb-1.5 font-medium">
                  {t("quickDemoAccounts")}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPhone("9876543210")}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 transition active:scale-95 font-medium"
                  >
                    Ramesh (9876543210)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhone("9811223344")}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 transition active:scale-95 font-medium"
                  >
                    Salim (9811223344)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-6 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98]"
              >
                <span>{t("sendOtpBtn")}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center py-1">
                <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto mb-2">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  {t("enterOtp")}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t("enterOtpSubtitle")}{" "}
                  <span className="font-semibold text-slate-900">+91 {phone}</span>
                </p>
              </div>

              {/* 4 Digit Boxes - compact, strictly fixed dimensions */}
              <div className="flex items-center justify-center gap-3 py-3 mx-auto w-fit">
                {[0, 1, 2, 3].map((idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    size={1}
                    maxLength={1}
                    value={otp[idx]}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    style={{
                      width: "44px",
                      height: "48px",
                      minWidth: "44px",
                      maxWidth: "44px",
                    }}
                    className="w-[44px] h-[48px] min-w-0 max-w-[44px] shrink-0 text-center text-xl font-mono font-bold rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none transition shadow-sm"
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              {/* Demo Hint Banner */}
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center justify-between">
                <span>{t("demoOtpNotice")}</span>
                <button
                  type="button"
                  onClick={() => setOtp(["4", "9", "1", "2"])}
                  className="text-[11px] font-bold text-blue-700 underline ml-2 shrink-0 hover:text-blue-900"
                >
                  Auto-fill 4912
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
              >
                <span>{loading ? "Verifying..." : t("verifyBtn")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        <p className="text-[11px] text-slate-400 text-center mt-6">
          RecyConnect Field • CPCB Circular Network
        </p>
      </div>
    </div>
  );
}
