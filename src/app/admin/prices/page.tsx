import { prisma } from "@/lib/prisma";
import { AdminPricesClient } from "@/components/admin/AdminPricesClient";

export const dynamic = "force-dynamic";

export default async function AdminPricesPage() {
  const prices = await prisma.price.findMany({
    orderBy: { materialCategory: "asc" },
  });

  const serialized = prices.map((p) => {
    const spread = Math.round((p.formalPricePerKg - p.informalPricePerKg) * 10) / 10;
    const percentGain = Math.round(
      ((p.formalPricePerKg - p.informalPricePerKg) / p.informalPricePerKg) * 100
    );
    return {
      id: p.id,
      materialCategory: p.materialCategory,
      subCategory: p.subCategory,
      informalPricePerKg: p.informalPricePerKg,
      formalPricePerKg: p.formalPricePerKg,
      priceMin: p.priceMin,
      priceMax: p.priceMax,
      spread,
      percentGain,
      unit: p.unit,
      location: p.location,
      date: p.date.toISOString(),
    };
  });

  return <AdminPricesClient initialPrices={serialized} />;
}
