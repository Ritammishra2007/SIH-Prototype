import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { CollectorProfileClient } from "@/components/collector/CollectorProfileClient";

export default async function CollectorProfilePage() {
  const session = await getSession();

  const collector = session?.userId
    ? await prisma.collector.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          name: true,
          phone: true,
          generalLocation: true,
          preferredLanguage: true,
        },
      })
    : null;

  const transactions = session?.userId
    ? await prisma.transaction.findMany({
        where: { collectorId: session.userId },
        select: { weightKg: true },
      })
    : [];

  const totalKg = transactions.reduce((sum, t) => sum + t.weightKg, 0);
  const totalLots = transactions.length;

  return (
    <CollectorProfileClient
      collector={collector}
      totalKg={totalKg}
      totalLots={totalLots}
    />
  );
}
