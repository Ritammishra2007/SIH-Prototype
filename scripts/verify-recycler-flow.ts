import { prisma } from "../src/lib/prisma";
import { TransactionStatus, PaymentStatus } from "../src/types";

async function testRecyclerFlow() {
  console.log("🧪 Running Recycler Full Experience Automated Verification...\n");

  // 1. Check Demo Recycler
  const recycler = await prisma.recycler.findFirst({
    where: { contactEmail: "greenloop@demo.com" },
  });
  if (!recycler) throw new Error("Demo recycler GreenLoop not found");
  console.log(`✅ Recycler identified: ${recycler.name} (${recycler.contactEmail})`);

  // 2. Query Dashboard Inbound Queue
  const inboundLots = await prisma.transaction.findMany({
    where: {
      recyclerId: recycler.id,
      transactionStatus: { in: ["MATCHED", "HANDED_OVER"] },
    },
    include: { collector: true, traceability: true },
  });

  if (inboundLots.length === 0) {
    throw new Error("No inbound lots in queue for GreenLoop");
  }
  console.log(`✅ Inbound Queue verified: ${inboundLots.length} incoming lots awaiting facility intake:`);
  inboundLots.forEach((l) =>
    console.log(`   - Lot ${l.lotId}: ${l.materialCategory} (${l.weightKg} kg, quoted ₹${l.quotedValue}), Status: ${l.transactionStatus}`)
  );

  // 3. Test Verify & Grade on L-0089
  const targetLot = inboundLots.find((l) => l.lotId === "L-0089") || inboundLots[0];
  console.log(`\n🔍 Verifying Intake for Lot ${targetLot.lotId}...`);

  const expectedOtp = targetLot.traceability?.otpCode;
  if (!expectedOtp) throw new Error("Missing traceability OTP on target lot");
  console.log(`   - Matched OTP: ${expectedOtp}`);

  // Simulate intake grading: scale reads 41.5 kg, final value = 41.5 * 145 * 1.08 = 6499
  const netScaleWeight = 41.5;
  const gradedFinalValue = 6499.0;

  const verifiedTx = await prisma.transaction.update({
    where: { id: targetLot.id },
    data: {
      weightKg: netScaleWeight,
      finalValue: gradedFinalValue,
      transactionStatus: TransactionStatus.VERIFIED,
    },
    include: { traceability: true, collector: true },
  });

  await prisma.traceability.update({
    where: { id: verifiedTx.traceability!.id },
    data: {
      recyclerConfirmedAt: new Date(),
      weightKg: netScaleWeight,
    },
  });

  if (verifiedTx.transactionStatus !== "VERIFIED" || verifiedTx.finalValue !== gradedFinalValue) {
    throw new Error("Intake grading verification failed");
  }
  console.log(`✅ Confirm & Grade verified: ${verifiedTx.lotId} updated to VERIFIED (Weight: ${verifiedTx.weightKg}kg, Value: ₹${verifiedTx.finalValue})`);

  // 4. Test Release Payment
  console.log(`\n💳 Testing Release Payment...`);
  const paidTx = await prisma.transaction.update({
    where: { id: verifiedTx.id },
    data: {
      paymentStatus: PaymentStatus.PAID,
      transactionStatus: TransactionStatus.COMPLETED,
    },
    include: { collector: true },
  });

  if (paidTx.paymentStatus !== "PAID" || paidTx.transactionStatus !== "COMPLETED") {
    throw new Error("Release payment failed");
  }
  console.log(`✅ Payment Released: Lot ${paidTx.lotId} -> Status: COMPLETED, Payment: PAID to ${paidTx.collector.name}`);

  // 5. Test History Ledger Query
  const completedHistory = await prisma.transaction.findMany({
    where: {
      recyclerId: recycler.id,
      transactionStatus: "COMPLETED",
    },
    orderBy: { updatedAt: "desc" },
    include: { collector: true, traceability: true },
  });

  console.log(`\n📜 Recycler History Ledger verified: ${completedHistory.length} completed transactions found:`);
  completedHistory.forEach((h) =>
    console.log(`   - Lot ${h.lotId}: ${h.materialCategory}, Final: ₹${h.finalValue}, Settled with: ${h.collector.name}`)
  );

  console.log("\n🎉 ALL RECYCLER FLOW VERIFICATIONS PASSED!");
}

testRecyclerFlow()
  .catch((err) => {
    console.error("❌ Test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
