import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth-utils";
import { AuthorizationStatus } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recyclers = await prisma.recycler.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    });

    const parsed = recyclers.map((r) => {
      let accepted: string[] = [];
      try {
        accepted = JSON.parse(r.materialsAccepted);
      } catch {
        accepted = [];
      }
      return {
        ...r,
        materialsAcceptedList: accepted,
        transactionCount: r._count.transactions,
      };
    });

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Fetch recyclers error:", error);
    return NextResponse.json({ error: "Failed to fetch recyclers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      location,
      contactPhone,
      contactEmail,
      materialsAccepted,
      registrationNumber,
      offeredRateMultiplier,
      pickupAvailable,
      serviceAreaKm,
    } = body;

    if (!name || !location || !contactPhone || !contactEmail) {
      return NextResponse.json(
        { error: "Name, location, contactPhone, and contactEmail are required" },
        { status: 400 }
      );
    }

    const regNum =
      registrationNumber ||
      `CPCB/EW-REG/${Math.floor(1000 + Math.random() * 9000)}`;

    const materialsArray = Array.isArray(materialsAccepted)
      ? materialsAccepted
      : ["PCB", "BATTERY"];

    // Creates new record with status PENDING by default per prompt
    const newRecycler = await prisma.recycler.create({
      data: {
        name,
        location,
        latitude: 28.6139 + (Math.random() - 0.5) * 0.15,
        longitude: 77.2090 + (Math.random() - 0.5) * 0.15,
        contactPhone,
        contactEmail: contactEmail.toLowerCase().trim(),
        registrationNumber: regNum,
        materialsAccepted: JSON.stringify(materialsArray),
        authorizationStatus: AuthorizationStatus.PENDING, // Default PENDING per brief
        offeredRateMultiplier: offeredRateMultiplier ? parseFloat(offeredRateMultiplier) : 1.05,
        pickupAvailable: Boolean(pickupAvailable),
        serviceAreaKm: serviceAreaKm ? parseFloat(serviceAreaKm) : 25.0,
        passwordHash: hashPassword("demo1234"),
      },
    });

    return NextResponse.json({
      success: true,
      recycler: newRecycler,
    });
  } catch (error: any) {
    console.error("Create recycler error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create recycler" },
      { status: 500 }
    );
  }
}
