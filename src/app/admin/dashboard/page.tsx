import { prisma } from "@/lib/prisma";
import { AdminOverviewClient } from "@/components/admin/AdminOverviewClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // 1. Recycler counts
  const totalRecyclersCount = await prisma.recycler.count();
  const authorizedRecyclersCount = await prisma.recycler.count({
    where: { authorizationStatus: "AUTHORIZED" },
  });
  const pendingRecyclersCount = await prisma.recycler.count({
    where: { authorizationStatus: "PENDING" },
  });
  const revokedRecyclersCount = await prisma.recycler.count({
    where: { authorizationStatus: "REVOKED" },
  });

  // 2. Transactions
  const allTransactions = await prisma.transaction.findMany({
    include: {
      collector: { select: { name: true, phone: true } },
      recycler: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalLotsCount = allTransactions.length;

  // Sum of Transaction.weightKg where transactionStatus = COMPLETED
  const completedTransactions = allTransactions.filter(
    (t) => t.transactionStatus === "COMPLETED"
  );

  const totalDivertedWeightKg = completedTransactions.reduce(
    (sum, t) => sum + t.weightKg,
    0
  );

  const totalFormalPayout = completedTransactions.reduce(
    (sum, t) => sum + (t.finalValue || t.quotedValue),
    0
  );

  // 3. Category volume breakdown for Recharts
  const categories = ["PCB", "BATTERY", "CABLE", "CRT_LCD", "MOTOR_MAGNET", "MIXED_PLASTIC"];
  const volumeByCategory = categories.map((cat) => {
    const catLots = allTransactions.filter((t) => t.materialCategory === cat);
    const totalKg = catLots.reduce((sum, t) => sum + t.weightKg, 0);
    const totalValue = catLots.reduce((sum, t) => sum + (t.finalValue || t.quotedValue), 0);
    const completedKg = catLots
      .filter((t) => t.transactionStatus === "COMPLETED")
      .reduce((sum, t) => sum + t.weightKg, 0);

    return {
      category: cat,
      totalKg: Math.round(totalKg * 10) / 10,
      completedKg: Math.round(completedKg * 10) / 10,
      lotsCount: catLots.length,
      totalValue,
    };
  });

  // 4. Recent activity
  const recentActivity = allTransactions.slice(0, 6).map((t) => ({
    id: t.id,
    lotId: t.lotId,
    materialCategory: t.materialCategory,
    weightKg: t.weightKg,
    quotedValue: t.quotedValue,
    finalValue: t.finalValue,
    paymentStatus: t.paymentStatus,
    transactionStatus: t.transactionStatus,
    createdAt: t.createdAt.toISOString(),
    collectorName: t.collector?.name || "Field Collector",
    recyclerName: t.recycler?.name || "Pending Facility",
  }));

  return (
    <AdminOverviewClient
      metrics={{
        totalRecyclersCount,
        authorizedRecyclersCount,
        pendingRecyclersCount,
        revokedRecyclersCount,
        totalLotsCount,
        totalDivertedWeightKg: Math.round(totalDivertedWeightKg * 10) / 10,
        totalFormalPayout,
      }}
      volumeByCategory={volumeByCategory}
      recentActivity={recentActivity}
    />
  );
}
