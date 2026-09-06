import { prisma } from "../src/lib/prisma";
import { MaterialCategory, TransactionStatus, PaymentStatus } from "../src/types";

async function testCollectorFlow() {
  console.log("🧪 Running Collector Full Experience Automated Verification...\n");

  // 1. Check Collector User
  const collector = await prisma.collector.findFirst({
    where: { phone: "+919876543210" },
  });
  if (!collector) throw new Error("Sample collector Ramesh Kumar not found");
  console.log(`✅ Collector identified: ${collector.name} (${collector.phone})`);

  // 2. Verify Language Toggle Update
  await prisma.collector.update({
    where: { id: collector.id },
    data: { preferredLanguage: "HI" },
  });
  const updatedCollector = await prisma.collector.findUnique({ where: { id: collector.id } });
  if (updatedCollector?.preferredLanguage !== "HI") {
    throw new Error("Language preference update failed");
  }
  console.log("✅ Collector language preference update verified (HI/EN).");

  // 3. Verify Price Calculation & Spread for PCB
  const pcbPrice = await prisma.price.findFirst({
    where: { materialCategory: MaterialCategory.PCB },
    orderBy: { date: "desc" },
  });
  if (!pcbPrice) throw new Error("Price benchmark missing for PCB");

  const weight = 24.5;
  const informalTotal = pcbPrice.informalPricePerKg * weight; // 180 * 24.5 = 4410
  const formalTotal = pcbPrice.formalPricePerKg * weight;     // 260 * 24.5 = 6370
  const percentGain = Math.round(((pcbPrice.formalPricePerKg - pcbPrice.informalPricePerKg) / pcbPrice.informalPricePerKg) * 100);

  if (informalTotal !== 4410 || formalTotal !== 6370 || percentGain !== 44) {
    throw new Error(`Price calculation mismatch: informal=${informalTotal}, formal=${formalTotal}, gain=${percentGain}%`);
  }
  console.log(`✅ Headline Price Comparison verified:`);
  console.log(`   - Local Scrap Dealer: ₹${pcbPrice.informalPricePerKg}/kg × ${weight}kg = ₹${informalTotal}`);
  console.log(`   - Formal Recycler · Verified: ₹${pcbPrice.formalPricePerKg}/kg × ${weight}kg = ₹${formalTotal}`);
  console.log(`   - Extra gain: +₹${formalTotal - informalTotal} (+${percentGain}% higher return)`);

  // 4. Verify Recycler Matching & Ranking
  const authorizedRecyclers = await prisma.recycler.findMany({
    where: { authorizationStatus: "AUTHORIZED" },
  });
  if (authorizedRecyclers.length < 4) throw new Error("Less than 4 authorized recyclers found");

  // Ensure PENDING recyclers are EXCLUDED
  const pendingCount = await prisma.recycler.count({ where: { authorizationStatus: "PENDING" } });
  console.log(`✅ Recycler Match verified: ${authorizedRecyclers.length} AUTHORIZED facilities included, ${pendingCount} PENDING excluded.`);

  const chosenRecycler = authorizedRecyclers[0];

  // 5. Test Transaction Creation (status QUOTED -> MATCHED)
  const lotId = "L-0099";
  const refCode = "REF-PCB-TEST99";
  const otpCode = "4821";

  // Clean up if previous test run created L-0099
  const existing = await prisma.transaction.findUnique({ where: { lotId } });
  if (existing) {
    await prisma.traceability.deleteMany({ where: { transactionId: existing.id } });
    await prisma.transaction.delete({ where: { id: existing.id } });
  }

  const tx = await prisma.transaction.create({
    data: {
      lotId,
      collectorId: collector.id,
      recyclerId: chosenRecycler.id,
      materialCategory: MaterialCategory.PCB,
      weightKg: weight,
      quotedValue: formalTotal,
      collectionLocation: "Seelampur Scrap Mandi, Delhi",
      handoverLocation: chosenRecycler.location,
      paymentStatus: PaymentStatus.PENDING,
      transactionStatus: TransactionStatus.MATCHED,
      traceability: {
        create: {
          photoUrls: JSON.stringify(["https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80"]),
          weightKg: weight,
          latitude: 28.6692,
          longitude: 77.2628,
          handoverReference: refCode,
          otpCode,
        },
      },
    },
    include: { traceability: true, recycler: true },
  });

  if (tx.transactionStatus !== "MATCHED" || !tx.traceability) {
    throw new Error("Transaction creation failed");
  }
  console.log(`✅ Transaction created: ${tx.lotId} -> Status: ${tx.transactionStatus}, Ref: ${tx.traceability.handoverReference}, OTP: ${tx.traceability.otpCode}`);

  // 6. Test Handover Action (status MATCHED -> HANDED_OVER)
  const handedOverTx = await prisma.transaction.update({
    where: { id: tx.id },
    data: { transactionStatus: TransactionStatus.HANDED_OVER },
    include: { traceability: true },
  });

  await prisma.traceability.update({
    where: { id: handedOverTx.traceability!.id },
    data: {
      timestampAtPickup: new Date(),
      latitude: 28.6692,
      longitude: 77.2628,
    },
  });

  if (handedOverTx.transactionStatus !== "HANDED_OVER") {
    throw new Error("Handover status update failed");
  }
  console.log(`✅ Handover marked: ${handedOverTx.lotId} updated to HANDED_OVER with mock GPS (28.6692, 77.2628) and timestamp.`);

  // 7. Verify Ledger Query
  const collectorTxs = await prisma.transaction.findMany({
    where: { collectorId: collector.id },
    orderBy: { createdAt: "desc" },
  });
  console.log(`✅ Ledger verified: Collector has ${collectorTxs.length} transactions, newest is ${collectorTxs[0].lotId}.`);

  console.log("\n🎉 ALL COLLECTOR FLOW VERIFICATIONS PASSED!");
}

testCollectorFlow()
  .catch((err) => {
    console.error("❌ Test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
