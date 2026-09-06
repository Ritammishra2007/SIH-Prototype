import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { RecyclerHistoryClient } from "@/components/recycler/RecyclerHistoryClient";

export default async function RecyclerHistoryPage() {
  const session = await getSession();

  const history = session?.userId
    ? await prisma.transaction.findMany({
        where: { recyclerId: session.userId },
        orderBy: { updatedAt: "desc" },
        include: {
          collector: {
            select: { name: true, phone: true, generalLocation: true },
          },
          traceability: {
            select: {
              handoverReference: true,
              recyclerConfirmedAt: true,
              timestampAtPickup: true,
            },
          },
        },
      })
    : [];

  const serialized = history.map((t) => ({
    id: t.id,
    lotId: t.lotId,
    materialCategory: t.materialCategory,
    weightKg: t.weightKg,
    quotedValue: t.quotedValue,
    finalValue: t.finalValue,
    paymentStatus: t.paymentStatus,
    transactionStatus: t.transactionStatus,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    collector: {
      name: t.collector.name,
      phone: t.collector.phone,
      generalLocation: t.collector.generalLocation,
    },
    traceability: t.traceability
      ? {
          handoverReference: t.traceability.handoverReference,
          recyclerConfirmedAt: t.traceability.recyclerConfirmedAt
            ? t.traceability.recyclerConfirmedAt.toISOString()
            : null,
          timestampAtPickup: t.traceability.timestampAtPickup.toISOString(),
        }
      : null,
  }));

  return <RecyclerHistoryClient initialHistory={serialized} />;
}
