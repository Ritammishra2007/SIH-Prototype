import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { RecyclerDashboardClient } from "@/components/recycler/RecyclerDashboardClient";

export default async function RecyclerDashboardPage() {
  const session = await getSession();

  const recycler = session?.userId
    ? await prisma.recycler.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          name: true,
          registrationNumber: true,
          authorizationStatus: true,
          offeredRateMultiplier: true,
          location: true,
        },
      })
    : null;

  if (!recycler) {
    return (
      <div className="p-8 text-center text-xs text-cream-dim">
        Recycler facility not found. Please log in again.
      </div>
    );
  }

  // Inbound queue: lots matched or handed over to this recycler
  const inboundQueue = await prisma.transaction.findMany({
    where: {
      recyclerId: recycler.id,
      transactionStatus: { in: ["MATCHED", "HANDED_OVER"] },
    },
    orderBy: { createdAt: "desc" },
    include: {
      collector: {
        select: { name: true, phone: true, generalLocation: true },
      },
      traceability: {
        select: {
          handoverReference: true,
          otpCode: true,
          timestampAtPickup: true,
          latitude: true,
          longitude: true,
        },
      },
    },
  });

  // Verified lots count
  const verifiedCount = await prisma.transaction.count({
    where: {
      recyclerId: recycler.id,
      transactionStatus: { in: ["VERIFIED", "COMPLETED"] },
    },
  });

  // Pending payout total
  const pendingPayoutTransactions = await prisma.transaction.findMany({
    where: {
      recyclerId: recycler.id,
      paymentStatus: "PENDING",
    },
    select: { quotedValue: true, finalValue: true },
  });

  const totalPayoutPending = pendingPayoutTransactions.reduce(
    (sum, t) => sum + (t.finalValue || t.quotedValue),
    0
  );

  const serializedQueue = inboundQueue.map((t) => ({
    id: t.id,
    lotId: t.lotId,
    materialCategory: t.materialCategory,
    weightKg: t.weightKg,
    quotedValue: t.quotedValue,
    finalValue: t.finalValue,
    paymentStatus: t.paymentStatus,
    transactionStatus: t.transactionStatus,
    createdAt: t.createdAt.toISOString(),
    collectionLocation: t.collectionLocation,
    collector: {
      name: t.collector.name,
      phone: t.collector.phone,
      generalLocation: t.collector.generalLocation,
    },
    traceability: t.traceability
      ? {
          handoverReference: t.traceability.handoverReference,
          otpCode: t.traceability.otpCode,
          timestampAtPickup: t.traceability.timestampAtPickup.toISOString(),
          latitude: t.traceability.latitude,
          longitude: t.traceability.longitude,
        }
      : null,
  }));

  return (
    <RecyclerDashboardClient
      recycler={recycler}
      metrics={{
        pendingVerificationCount: inboundQueue.length,
        verifiedCount,
        totalPayoutPending,
      }}
      inboundQueue={serializedQueue}
    />
  );
}
