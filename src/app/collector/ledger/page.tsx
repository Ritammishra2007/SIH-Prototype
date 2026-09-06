import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { CollectorLedgerClient } from "@/components/collector/CollectorLedgerClient";

export default async function CollectorLedgerPage() {
  const session = await getSession();

  const transactions = session?.userId
    ? await prisma.transaction.findMany({
        where: { collectorId: session.userId },
        orderBy: { createdAt: "desc" },
        include: {
          recycler: {
            select: { name: true, location: true },
          },
          traceability: {
            select: { handoverReference: true, otpCode: true },
          },
        },
      })
    : [];

  const serialized = transactions.map((t) => ({
    id: t.id,
    lotId: t.lotId,
    materialCategory: t.materialCategory,
    weightKg: t.weightKg,
    quotedValue: t.quotedValue,
    finalValue: t.finalValue,
    paymentStatus: t.paymentStatus,
    transactionStatus: t.transactionStatus,
    createdAt: t.createdAt.toISOString(),
    recycler: t.recycler
      ? {
          name: t.recycler.name,
          location: t.recycler.location,
        }
      : null,
    traceability: t.traceability
      ? {
          handoverReference: t.traceability.handoverReference,
          otpCode: t.traceability.otpCode,
        }
      : null,
  }));

  return <CollectorLedgerClient transactions={serialized} />;
}
