import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "RECYCLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recyclerId = session.userId;

    const recycler = await prisma.recycler.findUnique({
      where: { id: recyclerId },
      select: {
        id: true,
        name: true,
        registrationNumber: true,
        authorizationStatus: true,
        offeredRateMultiplier: true,
        location: true,
      },
    });

    if (!recycler) {
      return NextResponse.json({ error: "Recycler not found" }, { status: 404 });
    }

    // Inbound queue: lots matched or handed over to this recycler
    const inboundQueue = await prisma.transaction.findMany({
      where: {
        recyclerId,
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
            photoUrls: true,
            timestampAtPickup: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    });

    const pendingVerificationCount = inboundQueue.length;

    // Lots verified/completed
    const verifiedLots = await prisma.transaction.findMany({
      where: {
        recyclerId,
        transactionStatus: { in: ["VERIFIED", "COMPLETED"] },
      },
    });

    const verifiedCount = verifiedLots.length;

    // Total payout pending
    const pendingPayoutTransactions = await prisma.transaction.findMany({
      where: {
        recyclerId,
        paymentStatus: "PENDING",
      },
    });

    const totalPayoutPending = pendingPayoutTransactions.reduce(
      (sum, t) => sum + (t.finalValue || t.quotedValue),
      0
    );

    return NextResponse.json({
      recycler,
      metrics: {
        pendingVerificationCount,
        verifiedCount,
        totalPayoutPending,
      },
      inboundQueue,
    });
  } catch (error) {
    console.error("Recycler dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
