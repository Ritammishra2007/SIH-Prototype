import { prisma } from "@/lib/prisma";
import {
  CollectorPriceBoardClient,
  PriceBoardItem,
} from "@/components/collector/CollectorPriceBoardClient";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  "PCB",
  "BATTERY",
  "CABLE",
  "CRT_LCD",
  "MOTOR_MAGNET",
  "MIXED_PLASTIC",
];

export default async function CollectorPriceBoardPage() {
  const prices: PriceBoardItem[] = await Promise.all(
    CATEGORIES.map(async (cat) => {
      const history = await prisma.price.findMany({
        where: { materialCategory: cat },
        orderBy: { date: "desc" },
        take: 2,
      });

      const current = history[0];
      const previous = history[1] || null;

      const currentFormal = current?.formalPricePerKg ?? 0;
      const currentInformal = current?.informalPricePerKg ?? 0;
      const previousFormal = previous?.formalPricePerKg ?? null;
      const previousInformal = previous?.informalPricePerKg ?? null;

      const diffAmount =
        previousFormal !== null
          ? Math.round((currentFormal - previousFormal) * 10) / 10
          : 0;

      const diffPercent =
        previousFormal !== null && previousFormal > 0
          ? Math.round((diffAmount / previousFormal) * 1000) / 10
          : 0;

      const trend: "UP" | "DOWN" | "STEADY" =
        diffAmount > 0 ? "UP" : diffAmount < 0 ? "DOWN" : "STEADY";

      return {
        id: current?.id,
        materialCategory: cat,
        subCategory: current?.subCategory ?? null,
        formalPricePerKg: currentFormal,
        informalPricePerKg: currentInformal,
        priceMin: current?.priceMin ?? null,
        priceMax: current?.priceMax ?? null,
        unit: current?.unit ?? "kg",
        previousFormalPricePerKg: previousFormal,
        previousInformalPricePerKg: previousInformal,
        diffAmount,
        diffPercent,
        trend,
        location: current?.location ?? "Delhi NCR Scrap Hub",
        date: current?.date ? current.date.toISOString() : undefined,
      };
    })
  );

  return <CollectorPriceBoardClient prices={prices} />;
}
