"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CollectorTopBar } from "@/components/collector/CollectorTopBar";
import { useLanguage } from "@/context/LanguageContext";
import { QRCodeSVG } from "qrcode.react";
import {
  Cpu,
  BatteryCharging,
  Cable,
  Tv,
  Zap,
  Boxes,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Truck,
  MapPin,
  Copy,
  Receipt,
} from "lucide-react";

type MaterialCat = "PCB" | "BATTERY" | "CABLE" | "CRT_LCD" | "MOTOR_MAGNET" | "MIXED_PLASTIC";

interface CategoryOption {
  key: MaterialCat;
  nameKey: any;
  descKey: any;
  icon: React.ComponentType<{ className?: string }>;
}

const CATEGORIES: CategoryOption[] = [
  { key: "PCB", nameKey: "cat_PCB", descKey: "cat_PCB_desc", icon: Cpu },
  { key: "BATTERY", nameKey: "cat_BATTERY", descKey: "cat_BATTERY_desc", icon: BatteryCharging },
  { key: "CABLE", nameKey: "cat_CABLE", descKey: "cat_CABLE_desc", icon: Cable },
  { key: "CRT_LCD", nameKey: "cat_CRT_LCD", descKey: "cat_CRT_LCD_desc", icon: Tv },
  { key: "MOTOR_MAGNET", nameKey: "cat_MOTOR_MAGNET", descKey: "cat_MOTOR_MAGNET_desc", icon: Zap },
  { key: "MIXED_PLASTIC", nameKey: "cat_MIXED_PLASTIC", descKey: "cat_MIXED_PLASTIC_desc", icon: Boxes },
];

export default function NewLotWizardPage() {
  const router = useRouter();
  const { t } = useLanguage();

  // Wizard Steps: 1 to 5
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1: Selected Category
  const [selectedCategory, setSelectedCategory] = useState<MaterialCat>("PCB");

  // Step 2: Weight
  const [weightKg, setWeightKg] = useState<number>(20.0);

  // Step 3: Prices from API
  const [priceData, setPriceData] = useState<{
    informalPricePerKg: number;
    formalPricePerKg: number;
    unit: string;
  } | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);

  // Step 4: Recyclers
  const [recyclers, setRecyclers] = useState<any[]>([]);
  const [recyclersLoading, setRecyclersLoading] = useState(false);
  const [selectedRecycler, setSelectedRecycler] = useState<any | null>(null);

  // Step 5: Created Transaction & Handover Data
  const [creatingTx, setCreatingTx] = useState(false);
  const [createdTx, setCreatedTx] = useState<any | null>(null);
  const [handoverReference, setHandoverReference] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [markingHandover, setMarkingHandover] = useState(false);
  const [handoverDone, setHandoverDone] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch prices whenever category changes
  useEffect(() => {
    async function loadPrice() {
      setPriceLoading(true);
      try {
        const res = await fetch(`/api/prices?category=${selectedCategory}`);
        if (res.ok) {
          const data = await res.json();
          setPriceData(data);
        }
      } catch (err) {
        console.error("Price load error:", err);
      } finally {
        setPriceLoading(false);
      }
    }
    loadPrice();
  }, [selectedCategory]);

  // Fetch matched recyclers
  const loadRecyclers = async () => {
    setRecyclersLoading(true);
    try {
      const res = await fetch(`/api/recyclers/match?category=${selectedCategory}`);
      if (res.ok) {
        const data = await res.json();
        setRecyclers(data);
        if (data.length > 0) {
          setSelectedRecycler(data[0]);
        }
      }
    } catch (err) {
      console.error("Recyclers load error:", err);
    } finally {
      setRecyclersLoading(false);
    }
  };

  const handleSelectCategory = (cat: MaterialCat) => {
    setSelectedCategory(cat);
    setStep(2);
  };

  const handleWeightContinue = () => {
    setStep(3);
  };

  const handlePriceContinue = () => {
    loadRecyclers();
    setStep(4);
  };

  const handleCreateTransaction = async (recycler: any) => {
    setCreatingTx(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialCategory: selectedCategory,
          weightKg,
          recyclerId: recycler.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create lot");
      }

      setCreatedTx(data.transaction);
      setHandoverReference(data.handoverReference);
      setOtpCode(data.otpCode);
      setSelectedRecycler(recycler);
      setStep(5);
    } catch (err: any) {
      alert(err.message || "Failed to log lot transaction");
    } finally {
      setCreatingTx(false);
    }
  };

  const handleMarkHandedOver = async () => {
    if (!createdTx?.id) return;
    setMarkingHandover(true);
    try {
      const res = await fetch(`/api/transactions/${createdTx.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionStatus: "HANDED_OVER",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to record handover");
      }

      setHandoverDone(true);
    } catch (err: any) {
      alert(err.message || "Could not update status");
    } finally {
      setMarkingHandover(false);
    }
  };

  const handleCopyRef = () => {
    if (!handoverReference) return;
    navigator.clipboard.writeText(handoverReference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Benchmark Calculations
  const informalPerKg = priceData?.informalPricePerKg || 180;
  const formalPerKg = priceData?.formalPricePerKg || 260;
  const informalTotal = Math.round(informalPerKg * weightKg);
  const formalTotal = Math.round(formalPerKg * weightKg);
  const extraProfit = formalTotal - informalTotal;
  const percentGain = Math.round(((formalPerKg - informalPerKg) / informalPerKg) * 100);

  return (
    <div className="flex flex-col flex-1 bg-white">
      <CollectorTopBar
        title={
          step === 1
            ? t("selectCategoryTitle")
            : step === 2
            ? t("enterWeightTitle")
            : step === 3
            ? t("valueComparisonTitle")
            : step === 4
            ? t("matchRecyclerTitle")
            : t("handoverTitle")
        }
        showBack
        onBack={() => {
          if (step > 1 && !handoverDone) {
            setStep((prev) => (prev - 1) as any);
          } else {
            router.push("/collector/home");
          }
        }}
      />

      <div className="p-4 flex-1 flex flex-col justify-between">
        {/* Step Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5 px-1">
            <span>Step {step} of 5</span>
            <span className="text-blue-600 font-bold">
              {step === 1
                ? "Category"
                : step === 2
                ? "Weight"
                : step === 3
                ? "Price"
                : step === 4
                ? "Recycler"
                : "Handover"}
            </span>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  s <= step ? "bg-blue-600" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: CATEGORY SELECT */}
        {step === 1 && (
          <div className="space-y-3 flex-1">
            <p className="text-xs text-slate-500 px-1 mb-2">
              {t("selectCategorySubtitle")}
            </p>

            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => handleSelectCategory(cat.key)}
                    className={`p-3.5 rounded-2xl text-left transition-all duration-200 border-2 flex flex-col justify-between h-[125px] active:scale-95 ${
                      isSelected
                        ? "bg-blue-50/70 border-blue-600 shadow-md shadow-blue-500/10"
                        : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <ArrowRight
                        className={`w-4 h-4 ${
                          isSelected ? "text-blue-600" : "text-slate-400"
                        }`}
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        {t(cat.nameKey)}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                        {t(cat.descKey)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: WEIGHT ENTRY */}
        {step === 2 && (
          <div className="space-y-5 flex-1 flex flex-col justify-between">
            <div>
              <div className="text-center py-4">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  {t(
                    CATEGORIES.find((c) => c.key === selectedCategory)?.nameKey || "cat_PCB"
                  )}
                </span>
                <div className="flex items-baseline justify-center gap-2 mt-2">
                  <span className="text-6xl font-black text-blue-700 tracking-tight">
                    {weightKg.toFixed(1)}
                  </span>
                  <span className="text-xl font-bold text-slate-500">
                    {t("weightUnit")}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{t("slideHint")}</p>
              </div>

              {/* Slider Component */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
                <input
                  type="range"
                  min="1"
                  max="40"
                  step="0.5"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value))}
                  className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />

                {/* Quick Step Buttons */}
                <div className="flex justify-between items-center pt-1">
                  <button
                    type="button"
                    onClick={() => setWeightKg((prev) => Math.max(1, prev - 1))}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs active:scale-95"
                  >
                    - 1 kg
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeightKg((prev) => Math.max(1, prev - 5))}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs active:scale-95"
                  >
                    - 5 kg
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeightKg((prev) => Math.min(40, prev + 5))}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs active:scale-95"
                  >
                    + 5 kg
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeightKg((prev) => Math.min(40, prev + 1))}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs active:scale-95"
                  >
                    + 1 kg
                  </button>
                </div>

                {/* Preset Chips */}
                <div className="flex justify-between gap-2 pt-2 border-t border-slate-100">
                  {[5, 12, 24.5, 35].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setWeightKg(val)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        weightKg === val
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      {val} kg
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleWeightContinue}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98]"
            >
              <span>{t("continue")}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* STEP 3: INSTANT VALUE / PRICE COMPARISON */}
        {step === 3 && (
          <div className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-3.5">
              {/* Selected lot summary tag */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-800 font-medium">
                <span className="font-bold text-blue-700">
                  {t(CATEGORIES.find((c) => c.key === selectedCategory)?.nameKey || "cat_PCB")}
                </span>
                <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-900">
                  {weightKg.toFixed(1)} {t("weightUnit")}
                </span>
              </div>

              {/* CARD 1: Local Scrap Dealer (Informal) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {t("informalCardTitle")}
                    </h3>
                    <p className="text-[10px] text-slate-400">{t("informalCardSubtitle")}</p>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                    ₹{informalPerKg}{t("perKg")}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-baseline justify-between">
                  <span className="text-[11px]">{t("estimatedTotal")}</span>
                  <span className="text-xl font-bold text-slate-400 line-through decoration-rose-500/70">
                    ₹{informalTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* CARD 2: Formal Recycler · Verified */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/80 to-blue-100/40 border-2 border-blue-600 shadow-xl shadow-blue-500/10 space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {t("formalCardTitle")}
                      </h3>
                      <p className="text-[10px] text-blue-700 font-medium">{t("formalCardSubtitle")}</p>
                    </div>
                  </div>

                  {/* Percentage Gain Badge */}
                  <div className="px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center gap-1 shadow-sm">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                    <span>+{percentGain}%</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-blue-200/80 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block">{t("estimatedTotal")}</span>
                    <span className="text-[11px] text-blue-700 font-semibold">
                      Formal rate: ₹{formalPerKg}{t("perKg")}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-extrabold text-blue-700">
                      ₹{formalTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Extra Profit Highlight Ribbon */}
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800 font-semibold">
                  <span className="text-[11px]">{t("extraEarningsText")}</span>
                  <span className="font-bold text-emerald-700 text-sm whitespace-nowrap ml-2">
                    +₹{extraProfit.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePriceContinue}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98]"
            >
              <span>{t("chooseRecyclerBtn")}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* STEP 4: RECYCLER MATCH */}
        {step === 4 && (
          <div className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <p className="text-xs text-slate-500 px-1">
                {t("matchRecyclerSubtitle")}
              </p>

              {recyclersLoading ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  Matching authorized facilities...
                </div>
              ) : (
                <div className="space-y-2.5">
                  {recyclers.map((rec) => {
                    const bonusRatePerKg = Math.round(formalPerKg * rec.offeredRateMultiplier);
                    const totalEstimate = Math.round(bonusRatePerKg * weightKg);
                    const isSelected = selectedRecycler?.id === rec.id;

                    return (
                      <div
                        key={rec.id}
                        onClick={() => setSelectedRecycler(rec)}
                        className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? "bg-blue-50/60 border-blue-600 shadow-md shadow-blue-500/10"
                            : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-xs font-bold text-slate-900">{rec.name}</h4>
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                                {rec.authorizationStatus}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                              <span className="flex items-center gap-0.5">
                                <MapPin className="w-3 h-3 text-blue-600" />
                                {rec.distanceKm} km
                              </span>
                              <span>•</span>
                              <span className="text-emerald-600 font-semibold">
                                +{rec.rateBonusPercent}% {t("bonusRate")}
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-blue-700">
                              ₹{totalEstimate.toLocaleString("en-IN")}
                            </p>
                            <span className="text-[9px] text-slate-400">
                              ₹{bonusRatePerKg}/kg
                            </span>
                          </div>
                        </div>

                        {/* Pickup availability badge */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1 text-slate-500">
                            <Truck className="w-3 h-3 text-emerald-600" />
                            {rec.pickupAvailable ? t("pickupAvailable") : t("dropoffOnly")}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCreateTransaction(rec);
                            }}
                            disabled={creatingTx}
                            className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition active:scale-95 disabled:opacity-50 shadow-sm"
                          >
                            {creatingTx && isSelected ? "Booking..." : "Select"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedRecycler && (
              <button
                type="button"
                onClick={() => handleCreateTransaction(selectedRecycler)}
                disabled={creatingTx}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <span>{creatingTx ? "Creating Lot..." : t("selectAndConfirm")}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* STEP 5: HANDOVER SCREEN */}
        {step === 5 && (
          <div className="space-y-4 flex-1 flex flex-col justify-between">
            {!handoverDone ? (
              <div className="space-y-3.5 text-center">
                <div>
                  <span className="text-xs text-blue-700 font-bold uppercase tracking-wider">
                    {createdTx?.lotId || "Lot Created"}
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t("handoverSubtitle")}
                  </p>
                </div>

                {/* QR Code Container */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-900 inline-block mx-auto shadow-xl">
                  {handoverReference && (
                    <QRCodeSVG
                      value={handoverReference}
                      size={180}
                      bgColor="#FFFFFF"
                      fgColor="#0F172A"
                      level="H"
                    />
                  )}
                </div>

                {/* Handover Reference Code */}
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs text-slate-500">{t("lotReference")}:</span>
                  <span className="font-mono font-bold text-blue-700 text-sm bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                    {handoverReference}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyRef}
                    className="p-1 text-slate-400 hover:text-slate-700 transition"
                    title="Copy code"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {copied && <span className="text-[10px] text-emerald-600 font-semibold">Copied!</span>}
                </div>

                {/* Fallback 4-Digit OTP Code */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 max-w-[280px] mx-auto space-y-1 shadow-xs">
                  <p className="text-[11px] text-slate-500 font-medium">
                    {t("fallbackOtpTitle")}
                  </p>
                  <div className="flex items-center justify-center gap-2 font-mono py-0.5 mx-auto w-fit">
                    {otpCode.split("").map((digit, i) => (
                      <span
                        key={i}
                        style={{
                          width: "38px",
                          height: "42px",
                          minWidth: "38px",
                          maxWidth: "38px",
                        }}
                        className="w-[38px] h-[42px] min-w-0 max-w-[38px] shrink-0 rounded-lg bg-white border border-slate-300 flex items-center justify-center text-blue-700 font-bold text-lg shadow-xs"
                      >
                        {digit}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Payout & Recycler info */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between text-left">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Designated Recycler</span>
                    <span className="font-bold text-slate-900">{selectedRecycler?.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block text-[11px]">Quoted Payout</span>
                    <span className="font-bold text-blue-700 text-sm">
                      ₹{createdTx?.quotedValue?.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleMarkHandedOver}
                  disabled={markingHandover}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{markingHandover ? "Recording Handover..." : t("markHandedOverBtn")}</span>
                </button>
              </div>
            ) : (
              /* High-Delight Handover Success State */
              <div className="space-y-4 text-center py-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3 my-auto">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 mx-auto shadow-sm">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {t("handoverSuccessTitle")}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-[280px] mx-auto leading-relaxed">
                    {t("handoverSuccessDesc")}
                  </p>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-[320px] mx-auto text-left space-y-2 mt-4 shadow-sm">
                    <div className="flex justify-between text-xs pb-1.5 border-b border-slate-200">
                      <span className="text-slate-500">Lot ID</span>
                      <span className="font-mono font-bold text-slate-900">{createdTx?.lotId}</span>
                    </div>
                    <div className="flex justify-between text-xs pb-1.5 border-b border-slate-200">
                      <span className="text-slate-500">Material</span>
                      <span className="font-bold text-slate-900">{selectedCategory} ({weightKg} kg)</span>
                    </div>
                    <div className="flex justify-between text-xs pb-1.5 border-b border-slate-200">
                      <span className="text-slate-500">Recycler</span>
                      <span className="font-medium text-slate-900">{selectedRecycler?.name}</span>
                    </div>
                    <div className="flex justify-between text-xs pt-1">
                      <span className="text-slate-500">Quoted Amount</span>
                      <span className="font-bold text-blue-700 text-sm">
                        ₹{createdTx?.quotedValue?.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => router.push("/collector/ledger")}
                    className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition active:scale-[0.98]"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>{t("viewInLedgerBtn")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setHandoverDone(false);
                      setCreatedTx(null);
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition active:scale-95 shadow-sm"
                  >
                    {t("createNewLotBtn")}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
