import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "RECYCLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const whereClause: any = {
      recyclerId: session.userId,
    };

    if (status && status !== "ALL") {
      whereClause.transactionStatus = status;
    }

    const history = await prisma.transaction.findMany({
      where: whereClause,
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
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("Recycler history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
