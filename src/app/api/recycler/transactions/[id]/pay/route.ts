import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PaymentStatus, TransactionStatus } from "@/types";

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

    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const paymentMethod =
      body.paymentMethod === "CASH" ? "CASH" : "DIGITAL";

    // Flip paymentStatus to PAID, record paymentMethod, and mark transactionStatus as COMPLETED
    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        paymentStatus: PaymentStatus.PAID,
        paymentMethod: paymentMethod,
        transactionStatus: TransactionStatus.COMPLETED,
        finalValue: transaction.finalValue || transaction.quotedValue,
      },
      include: { collector: true, traceability: true },
    });

    return NextResponse.json({
      success: true,
      transaction: updated,
      message: `Payment of ₹${(updated.finalValue || updated.quotedValue).toLocaleString("en-IN")} released to ${updated.collector.name}`,
    });
  } catch (error) {
    console.error("Release payment error:", error);
    return NextResponse.json(
      { error: "Failed to release payment" },
      { status: 500 }
    );
  }
}
