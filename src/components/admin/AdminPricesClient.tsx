"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  RefreshCw,
  Edit3,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

interface PriceRecord {
  id: string;
  materialCategory: string;
  subCategory?: string | null;
  informalPricePerKg: number;
  formalPricePerKg: number;
  priceMin?: number | null;
  priceMax?: number | null;
  spread: number;
  percentGain: number;
  unit: string;
  location: string;
  date: string;
}

export function AdminPricesClient({
  initialPrices,
}: {
  initialPrices: PriceRecord[];
}) {
  const [prices, setPrices] = useState<PriceRecord[]>(initialPrices);
  const [selectedCategory, setSelectedCategory] = useState<string>("PCB");
  const [informalPrice, setInformalPrice] = useState<string>("180");
  const [formalPrice, setFormalPrice] = useState<string>("260");
  const [location, setLocation] = useState<string>("Delhi NCR Scrap Hub");
  const [updating, setUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    const existing = prices.find((p) => p.materialCategory === cat);
    if (existing) {
      setInformalPrice(existing.informalPricePerKg.toString());
      setFormalPrice(existing.formalPricePerKg.toString());
      setLocation(existing.location || "Delhi NCR Scrap Hub");
    }
  };

  const handleUpdatePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialCategory: selectedCategory,
          informalPricePerKg: parseFloat(informalPrice),
          formalPricePerKg: parseFloat(formalPrice),
          location,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update price");

      const informal = parseFloat(informalPrice);
      const formal = parseFloat(formalPrice);
      const spread = Math.round((formal - informal) * 10) / 10;
      const percentGain = Math.round(((formal - informal) / informal) * 100);

      setPrices((prev) =>
        prev.map((p) =>
          p.materialCategory === selectedCategory
            ? {
                ...p,
                informalPricePerKg: informal,
                formalPricePerKg: formal,
                spread,
                percentGain,
                date: new Date().toISOString(),
              }
            : p
        )
      );

      setStatusMessage(`Benchmark price for ${selectedCategory} updated successfully.`);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  const chartData = prices.map((p) => ({
    category: p.materialCategory,
    Informal: p.informalPricePerKg,
    Formal: p.formalPricePerKg,
    Spread: p.spread,
    Gain: p.percentGain,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const informal = payload[0]?.value;
      const formal = payload[1]?.value;
      const spread = formal - informal;
      const gain = Math.round((spread / informal) * 100);

      return (
        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xl text-xs space-y-1">
          <p className="font-bold text-slate-900 border-b border-slate-100 pb-1">{label}</p>
          <p className="text-slate-500 flex items-center justify-between gap-3">
            <span>Informal Mandi:</span>
            <span className="font-mono font-bold text-slate-700">₹{informal}/kg</span>
          </p>
          <p className="text-blue-700 flex items-center justify-between gap-3 font-semibold">
            <span>Formal Recycler:</span>
            <span className="font-mono font-bold">₹{formal}/kg</span>
          </p>
          <p className="text-emerald-700 flex items-center justify-between gap-3 pt-1 border-t border-slate-100 font-bold">
            <span>Incentive Premium:</span>
            <span>+₹{spread}/kg (+{gain}%)</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Price Surveillance &amp; Market Spreads
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tracking informal scrap mandi vs. authorized formal recycler benchmark rates
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 font-medium">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Real-time benchmark sync to Collector &amp; Recycler apps</span>
        </div>
      </div>

      {/* Chart: Informal vs Formal per Category */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Market Rate Comparison (₹ / kg)
            </h3>
            <p className="text-xs text-slate-500">
              Visualizing the government-supported price premium per material category
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-500 font-medium">
              <span className="w-3 h-3 rounded-sm bg-slate-300" />
              Informal Mandi (₹/kg)
            </span>
            <span className="flex items-center gap-1.5 text-blue-700 font-bold">
              <span className="w-3 h-3 rounded-sm bg-blue-600" />
              Formal Authorized (₹/kg)
            </span>
          </div>
        </div>

        <div className="h-[270px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis
                dataKey="category"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#E2E8F0" }}
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#E2E8F0" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Informal" fill="#CBD5E1" radius={[4, 4, 0, 0]} barSize={22} />
              <Bar dataKey="Formal" fill="#1D4ED8" radius={[4, 4, 0, 0]} barSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main Grid: Data Table (Left 7 cols) & Live Update Form (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Price Table (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Active Price Benchmarks
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Applied across Delhi NCR e-waste collection mandis
                </p>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {prices.length} categories
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Informal</th>
                    <th className="py-2.5 px-3">Formal Rate</th>
                    <th className="py-2.5 px-3">Spread Gain</th>
                    <th className="py-2.5 px-3 text-right">Quick Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {prices.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 block">{p.materialCategory}</span>
                        {p.subCategory && (
                          <span className="text-[10px] text-blue-700 block truncate max-w-[170px]">
                            {p.subCategory}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">
                        ₹{p.informalPricePerKg}/kg
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-blue-700 block">
                          ₹{p.formalPricePerKg}/kg
                        </span>
                        {p.priceMin !== null &&
                          p.priceMin !== undefined &&
                          p.priceMax !== null &&
                          p.priceMax !== undefined && (
                            <span className="text-[10px] text-slate-400 block font-mono">
                              Range: ₹{p.priceMin}–{p.priceMax}
                            </span>
                          )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold text-[10px] inline-flex items-center gap-0.5">
                          <ArrowUpRight className="w-3 h-3" />
                          +{p.percentGain}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleCategorySelect(p.materialCategory)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-[11px] font-medium transition active:scale-95 inline-flex items-center gap-1 border border-slate-200"
                        >
                          <Edit3 className="w-3 h-3 text-blue-600" />
                          <span>Select</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Updates propagate immediately to live collector quotations.</span>
            <span className="text-emerald-600 font-medium">Auto-synced</span>
          </div>
        </div>

        {/* Manual "Update Today's Price" Form (Right 5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white border-2 border-blue-200 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Update Today&apos;s Price
                </h3>
                <p className="text-[10px] text-slate-500">
                  Modify formal and informal benchmarks
                </p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold">
              SURVEILLANCE
            </span>
          </div>

          {statusMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{statusMessage}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePrice} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Material Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategorySelect(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-300 px-3 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-blue-600 focus:bg-white transition"
              >
                {prices.map((p) => (
                  <option key={p.materialCategory} value={p.materialCategory}>
                    {p.materialCategory}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Informal Mandi (₹/kg)
                </label>
                <div className="flex items-center rounded-xl bg-slate-50 border border-slate-300 px-3 py-2 focus-within:border-blue-600 focus-within:bg-white transition">
                  <span className="text-slate-400 mr-1">₹</span>
                  <input
                    type="number"
                    step="1"
                    value={informalPrice}
                    onChange={(e) => setInformalPrice(e.target.value)}
                    className="w-full bg-transparent text-slate-900 font-mono font-bold focus:outline-none text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Formal Recycler (₹/kg)
                </label>
                <div className="flex items-center rounded-xl bg-slate-50 border border-slate-300 px-3 py-2 focus-within:border-blue-600 focus-within:bg-white transition">
                  <span className="text-blue-700 font-bold mr-1">₹</span>
                  <input
                    type="number"
                    step="1"
                    value={formalPrice}
                    onChange={(e) => setFormalPrice(e.target.value)}
                    className="w-full bg-transparent text-blue-700 font-mono font-bold focus:outline-none text-xs"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Regional Hub Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />
            </div>

            {/* Live Calculation Preview */}
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between text-xs">
              <span className="text-slate-600">Calculated Incentive Gain:</span>
              <span className="font-mono font-bold text-emerald-700">
                +₹{Math.max(0, parseFloat(formalPrice || "0") - parseFloat(informalPrice || "0"))}/kg (
                {Math.round(
                  ((parseFloat(formalPrice || "0") - parseFloat(informalPrice || "0")) /
                    Math.max(1, parseFloat(informalPrice || "1"))) *
                    100
                )}
                %)
              </span>
            </div>

            <button
              type="submit"
              disabled={updating}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 transition active:scale-[0.98] disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${updating ? "animate-spin" : ""}`} />
              <span>{updating ? "Updating Live Benchmark..." : "Publish Benchmark Update"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
