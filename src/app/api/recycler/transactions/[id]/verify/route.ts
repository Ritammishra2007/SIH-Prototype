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
    if (!session || session.role !== "RECYCLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { finalWeightKg, finalValue, otpEntered } = body;

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { traceability: true },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Check OTP if provided and traceability exists
    if (otpEntered && transaction.traceability?.otpCode) {
      if (otpEntered.trim() !== transaction.traceability.otpCode.trim()) {
        return NextResponse.json(
          { error: "Invalid OTP code. Please check with the collector." },
          { status: 400 }
        );
      }
    }

    const netWeight = finalWeightKg ? parseFloat(finalWeightKg) : transaction.weightKg;
    const netValue = finalValue ? parseFloat(finalValue) : (transaction.quotedValue);

    // Update transaction to VERIFIED and set finalValue
    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        weightKg: netWeight,
        finalValue: netValue,
        transactionStatus: TransactionStatus.VERIFIED,
      },
      include: { traceability: true, collector: true },
    });

    // Update traceability with intake confirmation timestamp
    if (updated.traceability) {
      await prisma.traceability.update({
        where: { id: updated.traceability.id },
        data: {
          recyclerConfirmedAt: new Date(),
          weightKg: netWeight,
        },
      });
    }

    const finalRecord = await prisma.transaction.findUnique({
      where: { id },
      include: { traceability: true, collector: true },
    });

    return NextResponse.json({
      success: true,
      transaction: finalRecord,
    });
  } catch (error) {
    console.error("Recycler verify error:", error);
    return NextResponse.json(
      { error: "Failed to verify transaction" },
      { status: 500 }
    );
  }
}
