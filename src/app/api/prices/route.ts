import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

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

    // Return all prices
    const prices = await prisma.price.findMany({
      orderBy: { materialCategory: "asc" },
    });

    return NextResponse.json(prices);
  } catch (error) {
    console.error("Failed to fetch prices:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
