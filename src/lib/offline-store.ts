/**
 * RecyConnect Offline Storage & Synchronization Engine
 * Uses browser-native IndexedDB to store price benchmarks, recycler directory,
 * and offline-created lots. Automatically synchronizes when connectivity resumes.
 */

export interface OfflineLot {
  localId: string;
  tempLotId: string;
  materialCategory: string;
  weightKg: number;
  quotedValue: number;
  recyclerId: string;
  recyclerName: string;
  handoverReference: string;
  otpCode: string;
  status: "PENDING_SYNC" | "SYNCED";
  transactionStatus: "MATCHED" | "HANDED_OVER";
  createdAt: string;
  syncedAt?: string | null;
  serverLotId?: string | null;
}

const DB_NAME = "recyconnect_offline_db";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;

      // 1. Cache for Price Benchmarks
      if (!db.objectStoreNames.contains("prices")) {
        db.createObjectStore("prices", { keyPath: "materialCategory" });
      }

      // 2. Cache for Recycler Facilities
      if (!db.objectStoreNames.contains("recyclers")) {
        db.createObjectStore("recyclers", { keyPath: "id" });
      }

      // 3. Queue for Offline Lots
      if (!db.objectStoreNames.contains("offlineLots")) {
        const store = db.createObjectStore("offlineLots", { keyPath: "localId" });
        store.createIndex("status", "status", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      console.warn("[OfflineStore] Failed to open IndexedDB:", request.error);
      resolve(null);
    };
  });
}

// -------------------------------------------------------------
// 1. Price Caching & Retrieval
// -------------------------------------------------------------
export async function cachePrices(prices: any[]): Promise<void> {
  const db = await openDB();
  if (!db) return;

  try {
    const tx = db.transaction("prices", "readwrite");
    const store = tx.objectStore("prices");
    for (const p of prices) {
      if (p.materialCategory) {
        store.put(p);
      }
    }
  } catch (err) {
    console.warn("[OfflineStore] Failed to cache prices:", err);
  }
}

export async function getCachedPrices(): Promise<any[]> {
  const db = await openDB();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction("prices", "readonly");
      const store = tx.objectStore("prices");
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

export async function getCachedPrice(category: string): Promise<any | null> {
  const db = await openDB();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction("prices", "readonly");
      const store = tx.objectStore("prices");
      const req = store.get(category);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

// -------------------------------------------------------------
// 2. Recyclers Caching & Retrieval
// -------------------------------------------------------------
export async function cacheRecyclers(recyclers: any[]): Promise<void> {
  const db = await openDB();
  if (!db) return;

  try {
    const tx = db.transaction("recyclers", "readwrite");
    const store = tx.objectStore("recyclers");
    for (const r of recyclers) {
      if (r.id) {
        store.put(r);
      }
    }
  } catch (err) {
    console.warn("[OfflineStore] Failed to cache recyclers:", err);
  }
}

export async function getCachedRecyclers(category?: string): Promise<any[]> {
  const db = await openDB();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction("recyclers", "readonly");
      const store = tx.objectStore("recyclers");
      const req = store.getAll();
      req.onsuccess = () => {
        let list = req.result || [];
        if (category) {
          list = list.filter((r) => {
            try {
              const accepted = Array.isArray(r.materialsAccepted)
                ? r.materialsAccepted
                : JSON.parse(r.materialsAccepted || "[]");
              return accepted.includes(category);
            } catch {
              return true;
            }
          });
        }
        resolve(list);
      };
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

// -------------------------------------------------------------
// 3. Offline Lot Creation & Queue
// -------------------------------------------------------------
export async function saveOfflineLot(lot: OfflineLot): Promise<OfflineLot> {
  const db = await openDB();
  if (!db) return lot;

  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction("offlineLots", "readwrite");
      const store = tx.objectStore("offlineLots");
      const req = store.put(lot);
      req.onsuccess = () => {
        // Broadcast custom event so badge / ledger updates immediately
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("recyconnect:offlinelot_created", { detail: lot })
          );
        }
        resolve(lot);
      };
      req.onerror = () => reject(req.error);
    } catch (err) {
      reject(err);
    }
  });
}

export async function updateOfflineLotHandover(
  localId: string,
  newStatus: "MATCHED" | "HANDED_OVER"
): Promise<void> {
  const db = await openDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction("offlineLots", "readwrite");
      const store = tx.objectStore("offlineLots");
      const getReq = store.get(localId);

      getReq.onsuccess = () => {
        const item = getReq.result;
        if (item) {
          item.transactionStatus = newStatus;
          store.put(item);
        }
        resolve();
      };
      getReq.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function getPendingLots(): Promise<OfflineLot[]> {
  const db = await openDB();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction("offlineLots", "readonly");
      const store = tx.objectStore("offlineLots");
      const req = store.getAll();
      req.onsuccess = () => {
        const all: OfflineLot[] = req.result || [];
        resolve(all.filter((l) => l.status === "PENDING_SYNC"));
      };
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

export async function getAllOfflineLots(): Promise<OfflineLot[]> {
  const db = await openDB();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction("offlineLots", "readonly");
      const store = tx.objectStore("offlineLots");
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

// -------------------------------------------------------------
// 4. Background / Reactive Synchronization Engine
// -------------------------------------------------------------
let isSyncing = false;

export async function syncPendingLots(): Promise<{
  syncedCount: number;
  errors: any[];
}> {
  if (isSyncing) return { syncedCount: 0, errors: [] };
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { syncedCount: 0, errors: ["Network is offline"] };
  }

  isSyncing = true;
  const pending = await getPendingLots();

  if (pending.length === 0) {
    isSyncing = false;
    return { syncedCount: 0, errors: [] };
  }

  console.log(`[OfflineSync] Found ${pending.length} pending offline lots to sync.`);
  let syncedCount = 0;
  const errors: any[] = [];
  const db = await openDB();

  for (const lot of pending) {
    try {
      // 1. Create transaction on server with preserved offline reference & OTP
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialCategory: lot.materialCategory,
          weightKg: lot.weightKg,
          recyclerId: lot.recyclerId,
          handoverReference: lot.handoverReference,
          otpCode: lot.otpCode,
          transactionStatus: lot.transactionStatus,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || `Server responded with ${res.status}`);
      }

      const data = await res.json();
      const serverTx = data.transaction;

      // 2. If collector already marked it handed over locally while offline, update server status
      if (lot.transactionStatus === "HANDED_OVER" && serverTx?.id) {
        await fetch(`/api/transactions/${serverTx.id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transactionStatus: "HANDED_OVER",
          }),
        }).catch((e) => console.warn("Failed to patch status on sync:", e));
      }

      // 3. Update local store status to SYNCED
      if (db) {
        const tx = db.transaction("offlineLots", "readwrite");
        const store = tx.objectStore("offlineLots");
        lot.status = "SYNCED";
        lot.syncedAt = new Date().toISOString();
        lot.serverLotId = serverTx?.lotId || lot.tempLotId;
        store.put(lot);
      }

      syncedCount++;
    } catch (err: any) {
      console.error(`[OfflineSync] Failed to sync lot ${lot.localId}:`, err);
      errors.push({ localId: lot.localId, error: err.message });
    }
  }

  isSyncing = false;

  if (syncedCount > 0 && typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("recyconnect:synced", {
        detail: { syncedCount, totalPending: pending.length - syncedCount },
      })
    );
  }

  return { syncedCount, errors };
}
