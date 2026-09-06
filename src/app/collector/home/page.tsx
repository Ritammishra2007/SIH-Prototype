import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { CollectorHomeClient } from "@/components/collector/CollectorHomeClient";

export default async function CollectorHomePage() {
  const session = await getSession();

  const collector = session?.userId
    ? await prisma.collector.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          name: true,
          phone: true,
          generalLocation: true,
        },
      })
    : null;

  const transactions = session?.userId
    ? await prisma.transaction.findMany({
        where: { collectorId: session.userId },
        orderBy: { createdAt: "desc" },
        include: {
          recycler: {
            select: { name: true },
          },
          traceability: {
            select: { handoverReference: true, otpCode: true },
          },
        },
      })
    : [];

  const pendingBalance = transactions
    .filter((t) => t.paymentStatus === "PENDING")
    .reduce((sum, t) => sum + (t.finalValue || t.quotedValue), 0);

  const paidTotal = transactions
    .filter((t) => t.paymentStatus === "PAID")
    .reduce((sum, t) => sum + (t.finalValue || t.quotedValue), 0);

  const activeLotsCount = transactions.filter(
    (t) => t.transactionStatus !== "COMPLETED"
  ).length;

  const serializedTransactions = transactions.map((t) => ({
    id: t.id,
    lotId: t.lotId,
    materialCategory: t.materialCategory,
    weightKg: t.weightKg,
    quotedValue: t.quotedValue,
    finalValue: t.finalValue,
    paymentStatus: t.paymentStatus,
    transactionStatus: t.transactionStatus,
    createdAt: t.createdAt.toISOString(),
    recycler: t.recycler ? { name: t.recycler.name } : null,
    traceability: t.traceability
      ? {
          handoverReference: t.traceability.handoverReference,
          otpCode: t.traceability.otpCode,
        }
      : null,
  }));

  return (
    <CollectorHomeClient
      collector={collector}
      pendingBalance={pendingBalance}
      paidTotal={paidTotal}
      activeLotsCount={activeLotsCount}
      recentTransactions={serializedTransactions}
    />
  );
}
