import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Recycler stats
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

    // 2. Transaction stats
    const allTransactions = await prisma.transaction.findMany({
      include: {
        collector: { select: { name: true, phone: true } },
        recycler: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalLotsCount = allTransactions.length;

    // Sum of Transaction.weightKg where transactionStatus = COMPLETED (Exact brief requirement)
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

    // 3. Volume by Category for Recharts (Bar/Line chart)
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

    // 4. Recent national chain-of-custody transactions
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

    return NextResponse.json({
      metrics: {
        totalRecyclersCount,
        authorizedRecyclersCount,
        pendingRecyclersCount,
        revokedRecyclersCount,
        totalLotsCount,
        totalDivertedWeightKg: Math.round(totalDivertedWeightKg * 10) / 10,
        totalFormalPayout,
      },
      volumeByCategory,
      recentActivity,
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin overview" },
      { status: 500 }
    );
  }
}
