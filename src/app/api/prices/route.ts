import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const isBoard = searchParams.get("board") === "true";

    if (category) {
      const price = await prisma.price.findFirst({
        where: { materialCategory: category },
        orderBy: { date: "desc" },
      });

      if (!price) {
        return NextResponse.json(
          { error: `Price benchmark not found for category ${category}` },
          { status: 404 }
        );
      }

      return NextResponse.json(price);
    }

    // Return enriched price board with trends vs last week for all 6 categories
    const categories = [
      "PCB",
      "BATTERY",
      "CABLE",
      "CRT_LCD",
      "MOTOR_MAGNET",
      "MIXED_PLASTIC",
    ];

    const board = await Promise.all(
      categories.map(async (cat) => {
        const history = await prisma.price.findMany({
          where: { materialCategory: cat },
          orderBy: { date: "desc" },
          take: 2,
        });

        const current = history[0];
        const previous = history[1] || null;
        const diffAmount = previous
          ? Math.round((current.formalPricePerKg - previous.formalPricePerKg) * 10) / 10
          : 0;
        const diffPercent =
          previous && previous.formalPricePerKg > 0
            ? Math.round((diffAmount / previous.formalPricePerKg) * 1000) / 10
            : 0;
        const trend: "UP" | "DOWN" | "STEADY" =
          diffAmount > 0 ? "UP" : diffAmount < 0 ? "DOWN" : "STEADY";

        return {
          id: current?.id,
          materialCategory: cat,
          subCategory: current?.subCategory ?? null,
          formalPricePerKg: current?.formalPricePerKg ?? 0,
          informalPricePerKg: current?.informalPricePerKg ?? 0,
          priceMin: current?.priceMin ?? null,
          priceMax: current?.priceMax ?? null,
          unit: current?.unit ?? "kg",
          previousFormalPricePerKg: previous?.formalPricePerKg ?? null,
          previousInformalPricePerKg: previous?.informalPricePerKg ?? null,
          diffAmount,
          diffPercent,
          trend,
          location: current?.location ?? "Delhi NCR Scrap Hub",
          date: current?.date ?? new Date(),
        };
      })
    );

    return NextResponse.json(board);
  } catch (error) {
    console.error("Failed to fetch prices:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
