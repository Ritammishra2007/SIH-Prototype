"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RecyclerTopBar } from "@/components/recycler/RecyclerTopBar";
import {
  ScanLine,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Scale,
  IndianRupee,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  MapPin,
  ExternalLink,
} from "lucide-react";

interface LotTransaction {
  id: string;
  lotId: string;
  materialCategory: string;
  weightKg: number;
  quotedValue: number;
  finalValue: number | null;
  paymentStatus: string;
  paymentMethod?: string | null;
  transactionStatus: string;
  collectionLocation: string;
  collector: {
    name: string | null;
    phone: string;
    generalLocation: string;
  };
  traceability: {
    handoverReference: string;
    otpCode: string;
    photoUrls: string;
    latitude: number;
    longitude: number;
    timestampAtPickup: string;
  } | null;
}

const CATEGORY_IMAGES: Record<string, string[]> = {
  PCB: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80",
    "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=500&q=80",
  ],
  BATTERY: [
    "https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?w=500&q=80",
  ],
  CABLE: [
    "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=500&q=80",
  ],
  CRT_LCD: [
    "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80",
  ],
  MOTOR_MAGNET: [
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&q=80",
  ],
  MIXED_PLASTIC: [
    "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=500&q=80",
  ],
};

export function RecyclerVerifyClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialLotId = searchParams.get("lotId");

  const [inboundLots, setInboundLots] = useState<LotTransaction[]>([]);
  const [selectedLot, setSelectedLot] = useState<LotTransaction | null>(null);
  const [loading, setLoading] = useState(true);

  // Verification stage
  const [stage, setStage] = useState<"SCAN_OR_OTP" | "INSPECT_AND_GRADE" | "RELEASE_PAYMENT" | "SETTLED">("SCAN_OR_OTP");

  // OTP inputs
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [scanning, setScanning] = useState(false);

  // Grading state
  const [gradedWeightKg, setGradedWeightKg] = useState<number>(0);
  const [gradeQuality, setGradeQuality] = useState<"A" | "B" | "C">("A");
  const [verifying, setVerifying] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"DIGITAL" | "CASH">("DIGITAL");
  const [paymentToast, setPaymentToast] = useState("");

  // Load inbound lots
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch("/api/recycler/dashboard");
        if (res.ok) {
          const data = await res.json();
          setInboundLots(data.inboundQueue || []);

          if (initialLotId) {
            const found = (data.inboundQueue || []).find((l: LotTransaction) => l.id === initialLotId);
            if (found) {
              setSelectedLot(found);
              setGradedWeightKg(found.weightKg);
            }
          } else if (data.inboundQueue && data.inboundQueue.length > 0) {
            setSelectedLot(data.inboundQueue[0]);
            setGradedWeightKg(data.inboundQueue[0].weightKg);
          }
        }
      } catch (err) {
        console.error("Failed to load queue:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [initialLotId]);

  const handleSelectLot = (lot: LotTransaction) => {
    setSelectedLot(lot);
    setGradedWeightKg(lot.weightKg);
    setOtpDigits(["", "", "", ""]);
    setOtpError("");
    setStage("SCAN_OR_OTP");
  };

  const handleSimulateScan = () => {
    if (!selectedLot) return;
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setStage("INSPECT_AND_GRADE");
    }, 900);
  };

  const handleOtpChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const updated = [...otpDigits];
    updated[index] = digit;
    setOtpDigits(updated);

    if (digit && index < 3) {
      document.getElementById(`recycler-otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`recycler-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = () => {
    if (!selectedLot) return;
    setOtpError("");
    const entered = otpDigits.join("");
    const expected = selectedLot.traceability?.otpCode;

    if (entered.length < 4) {
      setOtpError("Please enter all 4 digits of the handover OTP");
      return;
    }

    if (expected && entered !== expected) {
      setOtpError(`Invalid OTP. For demo, collector's code is ${expected}`);
      return;
    }

    setStage("INSPECT_AND_GRADE");
  };

  const handleAutoFillOtp = () => {
    if (selectedLot?.traceability?.otpCode) {
      const code = selectedLot.traceability.otpCode;
      setOtpDigits([code[0], code[1], code[2], code[3]]);
    }
  };

  const gradeMultiplier = gradeQuality === "A" ? 1.0 : gradeQuality === "B" ? 0.95 : 0.90;
  const ratePerKg = selectedLot ? selectedLot.quotedValue / selectedLot.weightKg : 100;
  const calculatedFinalValue = Math.round(gradedWeightKg * ratePerKg * gradeMultiplier);

  const handleConfirmGrade = async () => {
    if (!selectedLot) return;
    setVerifying(true);
    try {
      const res = await fetch(`/api/recycler/transactions/${selectedLot.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          finalWeightKg: gradedWeightKg,
          finalValue: calculatedFinalValue,
          otpEntered: selectedLot.traceability?.otpCode || "4821",
        }),
      });

      if (!res.ok) throw new Error("Failed to verify intake");
      const data = await res.json();
      setSelectedLot(data.transaction);
      setStage("RELEASE_PAYMENT");
    } catch (err: any) {
      alert(err.message || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleReleasePayment = async () => {
    if (!selectedLot) return;
    setPaying(true);
    try {
      const res = await fetch(`/api/recycler/transactions/${selectedLot.id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod }),
      });
      if (!res.ok) throw new Error("Failed to release payment");
      const data = await res.json();
      setSelectedLot(data.transaction);
      setPaymentToast(
        data.message ||
          `Payment of ₹${calculatedFinalValue.toLocaleString("en-IN")} released via ${
            paymentMethod === "DIGITAL" ? "Digital UPI" : "Cash"
          }!`
      );
      setStage("SETTLED");
    } catch (err: any) {
      alert(err.message || "Payment release failed");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-xs text-slate-500 bg-white">
        Loading intake weighbridge...
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 pb-4 bg-white">
      <RecyclerTopBar
        title="Intake Weighbridge"
        subtitle={selectedLot ? `Verifying Lot ${selectedLot.lotId}` : "Digital Intake Scanner"}
        showBack
        onBack={() => router.push("/recycler/dashboard")}
      />

      <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
        {/* Lot Selector Tabs if multiple inbound lots exist */}
        {inboundLots.length > 1 && stage === "SCAN_OR_OTP" && (
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold mb-1.5 block px-1">
              Select Incoming Lot
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {inboundLots.map((lot) => (
                <button
                  key={lot.id}
                  type="button"
                  onClick={() => handleSelectLot(lot)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition ${
                    selectedLot?.id === lot.id
                      ? "bg-blue-600 text-white border-blue-600 font-bold shadow-sm"
                      : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  {lot.lotId} ({lot.materialCategory})
                </button>
              ))}
            </div>
          </div>
        )}

        {!selectedLot ? (
          <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 my-auto">
            No incoming lots assigned to your facility. Check back when a collector books a pickup.
          </div>
        ) : (
          <>
            {/* STAGE 1: QR SCANNER UI & MANUAL OTP ENTRY */}
            {stage === "SCAN_OR_OTP" && (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between mb-3 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Target Intake Lot</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {selectedLot.lotId} • {selectedLot.materialCategory}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block text-[10px]">Quoted Scale</span>
                      <span className="font-mono font-bold text-blue-700">
                        {selectedLot.weightKg} kg
                      </span>
                    </div>
                  </div>

                  {/* Camera Viewfinder Simulation */}
                  <div className="relative rounded-2xl bg-slate-900 border-2 border-slate-300 overflow-hidden p-6 text-center text-white space-y-3 shadow-xl">
                    <div className="w-48 h-48 mx-auto border-2 border-dashed border-blue-400/80 rounded-2xl flex flex-col items-center justify-center relative p-4">
                      {/* Corner viewfinder marks */}
                      <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-400" />
                      <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-400" />
                      <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-400" />
                      <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-400" />

                      <ScanLine className={`w-12 h-12 text-blue-400 ${scanning ? "animate-pulse" : ""}`} />

                      {scanning && (
                        <div className="absolute inset-x-2 top-1/2 h-0.5 bg-blue-400 shadow-[0_0_12px_#3B82F6] animate-bounce" />
                      )}

                      <span className="text-[11px] text-slate-300 mt-2 font-medium">
                        {scanning ? "Decoding QR Payload..." : "Align collector's QR code in frame"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleSimulateScan}
                      disabled={scanning}
                      className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition active:scale-95 disabled:opacity-50"
                    >
                      <ScanLine className="w-4 h-4" />
                      <span>{scanning ? "Scanning in progress..." : "Simulate Camera QR Scan"}</span>
                    </button>
                  </div>

                  {/* Fallback OTP Section */}
                  <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <KeyRound className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold">Fallback: 4-Digit Handover OTP</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleAutoFillOtp}
                        className="text-[10px] text-blue-700 font-semibold underline hover:text-blue-900"
                      >
                        Auto-fill OTP
                      </button>
                    </div>

                    {otpError && (
                      <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>{otpError}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-center gap-2.5 py-1 mx-auto w-fit">
                      {[0, 1, 2, 3].map((idx) => (
                        <input
                          key={idx}
                          id={`recycler-otp-${idx}`}
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          size={1}
                          maxLength={1}
                          value={otpDigits[idx]}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          style={{
                            width: "42px",
                            height: "46px",
                            minWidth: "42px",
                            maxWidth: "42px",
                          }}
                          className="w-[42px] h-[46px] min-w-0 max-w-[42px] shrink-0 text-center text-lg font-mono font-bold rounded-lg bg-white border border-slate-300 text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition shadow-xs"
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      className="w-full py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition active:scale-95"
                    >
                      Verify OTP Code
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 2: CONFIRM & GRADE */}
            {stage === "INSPECT_AND_GRADE" && (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3.5">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Handover Verified! Lot matched to Collector {selectedLot.collector.name}.</span>
                  </div>

                  {/* Photo & Category inspection */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2.5 shadow-sm">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      Category Intake Photos
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {(CATEGORY_IMAGES[selectedLot.materialCategory] || CATEGORY_IMAGES.PCB).map((imgUrl, i) => (
                        <div key={i} className="h-24 rounded-xl overflow-hidden border border-slate-200 relative bg-slate-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imgUrl}
                            alt={`${selectedLot.materialCategory} scrap`}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1 right-1 text-[9px] bg-black/70 text-white px-1.5 py-0.5 rounded backdrop-blur-sm">
                            Photo {i + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Weighbridge Adjustment Slider */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          Calibrated Weighbridge Reading
                        </span>
                        <p className="text-[11px] text-slate-500">
                          Adjust for moisture, chassis tare or contaminants
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-blue-700">
                          {gradedWeightKg.toFixed(1)} <span className="text-sm font-normal text-slate-500">kg</span>
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Quoted: {selectedLot.weightKg} kg
                        </span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min={Math.max(0.5, selectedLot.weightKg - 5)}
                      max={selectedLot.weightKg + 5}
                      step="0.1"
                      value={gradedWeightKg}
                      onChange={(e) => setGradedWeightKg(parseFloat(e.target.value))}
                      className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />

                    {/* Quality Purity Grade Selection */}
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[11px] text-slate-500 font-semibold uppercase block mb-1.5">
                        Batch Quality Grade
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {(["A", "B", "C"] as const).map((grade) => (
                          <button
                            key={grade}
                            type="button"
                            onClick={() => setGradeQuality(grade)}
                            className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                              gradeQuality === grade
                                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                            }`}
                          >
                            Grade {grade} ({grade === "A" ? "100%" : grade === "B" ? "-5% Tare" : "-10% Contam"})
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Adjusted Final Payout Preview */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-500 block">Final Settlement Amount</span>
                        <span className="text-[11px] text-slate-400">
                          Based on {gradedWeightKg.toFixed(1)}kg @ Grade {gradeQuality}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-extrabold text-blue-700">
                          ₹{calculatedFinalValue.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmGrade}
                  disabled={verifying}
                  className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <Scale className="w-5 h-5" />
                  <span>{verifying ? "Sealing Weighment..." : "Confirm & Seal Weighment"}</span>
                </button>
              </div>
            )}

            {/* STAGE 3: RELEASE PAYMENT */}
            {stage === "RELEASE_PAYMENT" && (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3.5">
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 text-center shadow-sm">
                    <div className="w-14 h-14 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 mx-auto">
                      <IndianRupee className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Intake Verified &amp; Ready for Settlement
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Weighbridge calibration and purity grading approved
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs shadow-sm">
                    <div className="flex justify-between pb-1.5 border-b border-slate-200">
                      <span className="text-slate-500">Lot Identifier</span>
                      <span className="font-mono font-bold text-slate-900">{selectedLot.lotId}</span>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-slate-200">
                      <span className="text-slate-500">Collector</span>
                      <span className="font-bold text-slate-900">
                        {selectedLot.collector.name} ({selectedLot.collector.phone})
                      </span>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-slate-200">
                      <span className="text-slate-500">Verified Intake Weight</span>
                      <span className="font-bold text-slate-900">
                        {gradedWeightKg.toFixed(1)} kg (Grade {gradeQuality})
                      </span>
                    </div>
                    <div className="flex justify-between text-xs pt-1">
                      <span className="text-slate-600 text-sm font-medium">Agreed Payout</span>
                      <span className="font-extrabold text-blue-700 text-2xl">
                        ₹{calculatedFinalValue.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2.5 shadow-sm text-left">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Disbursement Method
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("DIGITAL")}
                        className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                          paymentMethod === "DIGITAL"
                            ? "bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-500/20"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">Digital / UPI</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 leading-tight">
                          Instant UPI transfer to phone
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("CASH")}
                        className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                          paymentMethod === "CASH"
                            ? "bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-500/20"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">Physical Cash</span>
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 leading-tight">
                          Cash receipt at weighbridge gate
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                      {paymentMethod === "DIGITAL"
                        ? "Settlement simulates instant UPI transfer directly to collector's mobile."
                        : "Physical cash disbursement registered with timestamped gate voucher."}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReleasePayment}
                  disabled={paying}
                  className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <IndianRupee className="w-5 h-5" />
                  <span>
                    {paying
                      ? "Disbursing Settlement..."
                      : `Release Payment (${paymentMethod === "DIGITAL" ? "Digital UPI" : "Cash"})`}
                  </span>
                </button>
              </div>
            )}

            {/* STAGE 4: SETTLED SUCCESS TOAST / RECEIPT */}
            {stage === "SETTLED" && (
              <div className="space-y-4 text-center py-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3 my-auto">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 mx-auto shadow-sm">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Settlement Completed!
                  </h3>
                  <p className="text-xs text-slate-500 max-w-[280px] mx-auto leading-relaxed">
                    {paymentToast || "Payment successfully released and chain-of-custody sealed."}
                  </p>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-[320px] mx-auto text-left space-y-2 mt-4 shadow-sm">
                    <div className="flex justify-between text-xs pb-1.5 border-b border-slate-200">
                      <span className="text-slate-500">Lot ID</span>
                      <span className="font-mono font-bold text-slate-900">{selectedLot.lotId}</span>
                    </div>
                    <div className="flex justify-between text-xs pb-1.5 border-b border-slate-200">
                      <span className="text-slate-500">Collector</span>
                      <span className="font-bold text-slate-900">{selectedLot.collector.name}</span>
                    </div>
                    <div className="flex justify-between text-xs pb-1.5 border-b border-slate-200">
                      <span className="text-slate-500">Disbursement</span>
                      <span className="font-bold text-emerald-600">
                        PAID ({selectedLot.paymentMethod === "CASH" || paymentMethod === "CASH" ? "Physical Cash" : "Digital UPI"})
                      </span>
                    </div>
                    <div className="flex justify-between text-xs pt-1">
                      <span className="text-slate-500">Final Paid Value</span>
                      <span className="font-extrabold text-blue-700 text-sm">
                        ₹{(selectedLot.finalValue || calculatedFinalValue).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => router.push("/recycler/history")}
                    className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition active:scale-[0.98]"
                  >
                    <span>View Completed Lots &amp; Audit Logs</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStage("SCAN_OR_OTP");
                      setOtpDigits(["", "", "", ""]);
                      router.push("/recycler/dashboard");
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition active:scale-95 shadow-sm"
                  >
                    Return to Inbound Queue
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
