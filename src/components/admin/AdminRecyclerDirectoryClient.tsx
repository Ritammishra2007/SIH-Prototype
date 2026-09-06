"use client";

import React, { useState } from "react";
import {
  Building2,
  Plus,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Truck,
  MapPin,
  X,
  Search,
} from "lucide-react";

interface RecyclerItem {
  id: string;
  name: string;
  location: string;
  contactPhone: string;
  contactEmail: string;
  registrationNumber: string;
  authorizationStatus: "AUTHORIZED" | "PENDING" | "REVOKED" | string;
  offeredRateMultiplier: number;
  pickupAvailable: boolean;
  serviceAreaKm: number;
  materialsAcceptedList: string[];
  transactionCount: number;
}

const ALL_CATEGORIES = [
  { key: "PCB", label: "PCB / Motherboards" },
  { key: "BATTERY", label: "Batteries" },
  { key: "CABLE", label: "Copper Cables" },
  { key: "CRT_LCD", label: "CRT / LCD Panels" },
  { key: "MOTOR_MAGNET", label: "Motors & Magnets" },
  { key: "MIXED_PLASTIC", label: "Mixed Plastics" },
];

export function AdminRecyclerDirectoryClient({
  initialRecyclers,
}: {
  initialRecyclers: RecyclerItem[];
}) {
  const [recyclers, setRecyclers] = useState<RecyclerItem[]>(initialRecyclers);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Add Recycler Form State
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(["PCB", "BATTERY"]);
  const [multiplier, setMultiplier] = useState("1.05");
  const [pickup, setPickup] = useState(true);
  const [formError, setFormError] = useState("");

  const handleToggleMaterial = (mat: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat]
    );
  };

  const handleStatusChange = async (
    id: string,
    newStatus: "AUTHORIZED" | "PENDING" | "REVOKED"
  ) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/recyclers/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      setRecyclers((prev) =>
        prev.map((r) => (r.id === id ? { ...r, authorizationStatus: newStatus } : r))
      );
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddRecycler = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name || !location || !contactPhone || !contactEmail) {
      setFormError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/recyclers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          location,
          contactPhone,
          contactEmail,
          materialsAccepted: selectedMaterials,
          offeredRateMultiplier: parseFloat(multiplier),
          pickupAvailable: pickup,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add recycler");

      const added: RecyclerItem = {
        ...data.recycler,
        materialsAcceptedList: selectedMaterials,
        transactionCount: 0,
      };

      setRecyclers([added, ...recyclers]);
      setIsAddModalOpen(false);

      setName("");
      setLocation("");
      setContactPhone("");
      setContactEmail("");
      setSelectedMaterials(["PCB", "BATTERY"]);
    } catch (err: any) {
      setFormError(err.message || "Error creating recycler");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = recyclers.filter((r) => {
    if (statusFilter !== "ALL" && r.authorizationStatus !== statusFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        r.name.toLowerCase().includes(term) ||
        r.location.toLowerCase().includes(term) ||
        r.registrationNumber.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const authorizedCount = recyclers.filter((r) => r.authorizationStatus === "AUTHORIZED").length;
  const pendingCount = recyclers.filter((r) => r.authorizationStatus === "PENDING").length;
  const revokedCount = recyclers.filter((r) => r.authorizationStatus === "REVOKED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Authorized Recycler Directory &amp; Permits
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Surveillance registry under Central Pollution Control Board (CPCB) E-Waste Regulations
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold transition shadow-md shadow-blue-500/20 flex items-center gap-1.5 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Recycler Facility</span>
        </button>
      </div>

      {/* Summary Stat Pills */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">
              Authorized Units
            </span>
            <p className="text-xl font-bold text-emerald-600 mt-0.5">{authorizedCount}</p>
          </div>
          <ShieldCheck className="w-6 h-6 text-emerald-500" />
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">
              Pending Authorization
            </span>
            <p className="text-xl font-bold text-blue-700 mt-0.5">{pendingCount}</p>
          </div>
          <AlertTriangle className="w-6 h-6 text-blue-500" />
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">
              Revoked Permits
            </span>
            <p className="text-xl font-bold text-rose-600 mt-0.5">{revokedCount}</p>
          </div>
          <XCircle className="w-6 h-6 text-rose-500" />
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="flex-1 flex items-center rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs focus-within:border-blue-600 transition shadow-sm">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search facility by name, location, or CPCB license number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none text-xs"
          />
        </div>

        <div className="flex gap-1.5">
          {[
            { key: "ALL", label: `All (${recyclers.length})` },
            { key: "AUTHORIZED", label: `Authorized (${authorizedCount})` },
            { key: "PENDING", label: `Pending (${pendingCount})` },
            { key: "REVOKED", label: `Revoked (${revokedCount})` },
          ].map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition ${
                statusFilter === f.key
                  ? "bg-blue-600 text-white border-blue-600 font-bold shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recyclers Data Table */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Facility &amp; License</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Materials Accepted</th>
                <th className="py-3 px-4">Rate Bonus</th>
                <th className="py-3 px-4">Pickup</th>
                <th className="py-3 px-4">Authorization Status</th>
                <th className="py-3 px-4 text-right">Permit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filtered.map((r) => {
                const isAuth = r.authorizationStatus === "AUTHORIZED";
                const isPending = r.authorizationStatus === "PENDING";
                const isRevoked = r.authorizationStatus === "REVOKED";

                return (
                  <tr key={r.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm">{r.name}</div>
                      <div className="font-mono text-[10px] text-blue-700 mt-0.5">
                        {r.registrationNumber}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {r.contactEmail} • {r.contactPhone}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600 max-w-[200px]">
                      <div className="flex items-start gap-1">
                        <MapPin className="w-3 h-3 text-blue-600 shrink-0 mt-0.5" />
                        <span>{r.location}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {r.materialsAcceptedList.map((m) => (
                          <span
                            key={m}
                            className="px-2 py-0.5 rounded bg-slate-100 text-[10px] text-slate-700 border border-slate-200"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-blue-700">
                      +{Math.round((r.offeredRateMultiplier - 1.0) * 100)}%
                    </td>

                    <td className="py-3 px-4">
                      {r.pickupAvailable ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                          <Truck className="w-3 h-3" /> Yes ({r.serviceAreaKm}km)
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Drop-off only</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          isAuth
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : isPending
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {isAuth && <ShieldCheck className="w-3 h-3" />}
                        {isPending && <AlertTriangle className="w-3 h-3" />}
                        {isRevoked && <XCircle className="w-3 h-3" />}
                        <span>{r.authorizationStatus}</span>
                      </span>
                    </td>

                    {/* Status Toggle Action Buttons */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex rounded-lg bg-slate-100 border border-slate-200 p-0.5">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(r.id, "AUTHORIZED")}
                          disabled={updatingId === r.id || isAuth}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                            isAuth
                              ? "bg-emerald-600 text-white"
                              : "text-slate-600 hover:text-emerald-700"
                          }`}
                          title="Authorize permit"
                        >
                          Auth
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(r.id, "PENDING")}
                          disabled={updatingId === r.id || isPending}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                            isPending
                              ? "bg-blue-600 text-white"
                              : "text-slate-600 hover:text-blue-700"
                          }`}
                          title="Set pending"
                        >
                          Pend
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(r.id, "REVOKED")}
                          disabled={updatingId === r.id || isRevoked}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                            isRevoked
                              ? "bg-rose-600 text-white"
                              : "text-slate-600 hover:text-rose-700"
                          }`}
                          title="Revoke permit"
                        >
                          Revoke
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Recycler Modal Form */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Register Recycler Facility
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              New facilities will be registered with status <strong className="text-blue-700">PENDING</strong> by default for CPCB inspection review.
            </p>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddRecycler} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Facility Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apex E-Waste Refineries Ltd"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-300 px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Physical Plant Location (City/Industrial Area) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Patparganj Industrial Area, Delhi"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-300 px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="text"
                    placeholder="+91 11 4455 6677"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-300 px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    placeholder="intake@facility.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-300 px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Materials Permitted / Accepted
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_CATEGORIES.map((c) => {
                    const isChecked = selectedMaterials.includes(c.key);
                    return (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => handleToggleMaterial(c.key)}
                        className={`py-1.5 px-2.5 rounded-lg text-xs text-left border transition ${
                          isChecked
                            ? "bg-blue-50 border-blue-500 text-blue-700 font-bold"
                            : "bg-slate-50 border-slate-200 text-slate-600"
                        }`}
                      >
                        {isChecked ? "✓ " : "+ "}
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Rate Multiplier vs Base
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.0"
                    max="1.5"
                    value={multiplier}
                    onChange={(e) => setMultiplier(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-300 px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={pickup}
                      onChange={(e) => setPickup(e.target.checked)}
                      className="w-4 h-4 rounded accent-blue-600"
                    />
                    <span>Doorstep Pickup Available</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold transition shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {submitting ? "Registering..." : "Submit Registration (PENDING)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
