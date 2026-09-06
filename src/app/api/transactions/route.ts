import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PaymentStatus, TransactionStatus } from "@/types";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "COLLECTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transactions = await prisma.transaction.findMany({
      where: { collectorId: session.userId },
      orderBy: { createdAt: "desc" },
      include: {
        recycler: true,
        traceability: true,
      },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Fetch transactions error:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "COLLECTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { materialCategory, weightKg, recyclerId, collectionLocation } = body;

    if (!materialCategory || !weightKg || !recyclerId) {
      return NextResponse.json(
        { error: "materialCategory, weightKg, and recyclerId are required" },
        { status: 400 }
      );
    }

    // 1. Get price benchmark for category
    const price = await prisma.price.findFirst({
      where: { materialCategory },
      orderBy: { date: "desc" },
    });

    const baseFormalRate = price?.formalPricePerKg || 100;

    // 2. Get recycler multiplier
    const recycler = await prisma.recycler.findUnique({
      where: { id: recyclerId },
    });

    const multiplier = recycler?.offeredRateMultiplier || 1.0;
    const finalRatePerKg = baseFormalRate * multiplier;
    const quotedValue = Math.round(weightKg * finalRatePerKg);

    // 3. Generate sequential human-readable lotId (e.g. L-0092)
    const count = await prisma.transaction.count();
    const nextSeq = 92 + count; // start from L-0092+
    const lotId = `L-${String(nextSeq).padStart(4, "0")}`;

    // 4. Generate unique handoverReference and 4-digit OTP
    const refCode = `REF-${materialCategory.substring(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    // 5. Create transaction and initial traceability record
    const transaction = await prisma.transaction.create({
      data: {
        lotId,
        collectorId: session.userId,
        recyclerId,
        materialCategory,
        weightKg: parseFloat(weightKg),
        quotedValue,
        collectionLocation: collectionLocation || "Seelampur Scrap Mandi, Delhi",
        handoverLocation: recycler?.location || "Designated Recycler Depot",
        paymentStatus: PaymentStatus.PENDING,
        transactionStatus: TransactionStatus.MATCHED,
        traceability: {
          create: {
            photoUrls: JSON.stringify([
              "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80",
            ]),
            weightKg: parseFloat(weightKg),
            latitude: 28.6692,
            longitude: 77.2628,
            handoverReference: refCode,
            otpCode,
          },
        },
      },
      include: {
        recycler: true,
        traceability: true,
      },
    });

    return NextResponse.json({
      success: true,
      transaction,
      handoverReference: refCode,
      otpCode,
    });
  } catch (error) {
    console.error("Create transaction error:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
