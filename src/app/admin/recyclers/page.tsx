import { prisma } from "@/lib/prisma";
import { AdminRecyclerDirectoryClient } from "@/components/admin/AdminRecyclerDirectoryClient";

export const dynamic = "force-dynamic";

export default async function AdminRecyclersPage() {
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
      id: r.id,
      name: r.name,
      location: r.location,
      contactPhone: r.contactPhone,
      contactEmail: r.contactEmail,
      registrationNumber: r.registrationNumber,
      authorizationStatus: r.authorizationStatus,
      offeredRateMultiplier: r.offeredRateMultiplier,
      pickupAvailable: r.pickupAvailable,
      serviceAreaKm: r.serviceAreaKm,
      materialsAcceptedList: accepted,
      transactionCount: r._count.transactions,
    };
  });

  return <AdminRecyclerDirectoryClient initialRecyclers={parsed} />;
}
