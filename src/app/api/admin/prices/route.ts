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

    const prices = await prisma.price.findMany({
      orderBy: { materialCategory: "asc" },
      include: { recycler: { select: { name: true } } },
    });

    const enriched = prices.map((p) => {
      const spread = Math.round((p.formalPricePerKg - p.informalPricePerKg) * 10) / 10;
      const percentGain = Math.round(
        ((p.formalPricePerKg - p.informalPricePerKg) / p.informalPricePerKg) * 100
      );
      return {
        ...p,
        spread,
        percentGain,
      };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Fetch admin prices error:", error);
    return NextResponse.json({ error: "Failed to fetch prices" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { materialCategory, informalPricePerKg, formalPricePerKg, location } = body;

    if (!materialCategory || informalPricePerKg === undefined || formalPricePerKg === undefined) {
      return NextResponse.json(
        { error: "materialCategory, informalPricePerKg, and formalPricePerKg are required" },
        { status: 400 }
      );
    }

    const informal = parseFloat(informalPricePerKg);
    const formal = parseFloat(formalPricePerKg);

    // Update existing or create new benchmark record in SQLite
    const existing = await prisma.price.findFirst({
      where: { materialCategory },
    });

    let updatedPrice;
    if (existing) {
      updatedPrice = await prisma.price.update({
        where: { id: existing.id },
        data: {
          informalPricePerKg: informal,
          formalPricePerKg: formal,
          location: location || existing.location,
          date: new Date(),
        },
      });
    } else {
      updatedPrice = await prisma.price.create({
        data: {
          materialCategory,
          informalPricePerKg: informal,
          formalPricePerKg: formal,
          location: location || "Delhi NCR Scrap Hub",
          unit: "kg",
          date: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      price: updatedPrice,
      message: `Price for ${materialCategory} updated: Informal ₹${informal}/kg → Formal ₹${formal}/kg`,
    });
  } catch (error) {
    console.error("Update price error:", error);
    return NextResponse.json({ error: "Failed to update price" }, { status: 500 });
  }
}
