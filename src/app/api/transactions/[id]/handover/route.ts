import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { TransactionStatus } from "@/types";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "COLLECTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { traceability: true, recycler: true },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Update status to HANDED_OVER
    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        transactionStatus: TransactionStatus.HANDED_OVER,
      },
      include: { traceability: true, recycler: true },
    });

    // Update or create traceability record with mock GPS coordinate and current timestamp
    if (updated.traceability) {
      await prisma.traceability.update({
        where: { id: updated.traceability.id },
        data: {
          timestampAtPickup: new Date(),
          latitude: 28.6692, // Delhi NCR Scrap Hub GPS
          longitude: 77.2628,
        },
      });
    } else {
      const refCode = `REF-${transaction.materialCategory.substring(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`;
      const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

      await prisma.traceability.create({
        data: {
          transactionId: id,
          photoUrls: JSON.stringify([
            "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80",
          ]),
          weightKg: transaction.weightKg,
          timestampAtPickup: new Date(),
          latitude: 28.6692,
          longitude: 77.2628,
          handoverReference: refCode,
          otpCode,
        },
      });
    }

    const finalRecord = await prisma.transaction.findUnique({
      where: { id },
      include: { traceability: true, recycler: true },
    });

    return NextResponse.json({
      success: true,
      transaction: finalRecord,
    });
  } catch (error) {
    console.error("Mark handed over error:", error);
    return NextResponse.json(
      { error: "Failed to mark transaction as handed over" },
      { status: 500 }
    );
  }
}
