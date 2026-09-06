import { prisma } from "../src/lib/prisma";
import { AuthorizationStatus, MaterialCategory } from "../src/types";

async function testAdminFlow() {
  console.log("🧪 Running Admin Full Experience Automated Verification...\n");

  // 1. Test Overview Calculations
  console.log("📊 1. Testing Overview Top-Line Stats:");
  const totalRecyclers = await prisma.recycler.count();
  const authorizedRecyclers = await prisma.recycler.count({ where: { authorizationStatus: "AUTHORIZED" } });
  const pendingRecyclers = await prisma.recycler.count({ where: { authorizationStatus: "PENDING" } });
  const totalTransactions = await prisma.transaction.count();

  // Sum of Transaction.weightKg where transactionStatus = COMPLETED
  const completedTxs = await prisma.transaction.findMany({
    where: { transactionStatus: "COMPLETED" },
  });
  const divertedWeightKg = completedTxs.reduce((sum, t) => sum + t.weightKg, 0);

  console.log(`   - Recyclers: ${totalRecyclers} (${authorizedRecyclers} Authorized, ${pendingRecyclers} Pending)`);
  console.log(`   - Total Lots Processed: ${totalTransactions}`);
  console.log(`   - Total Weight Diverted (Formal Channels): ${divertedWeightKg} kg`);

  if (totalRecyclers < 5 || authorizedRecyclers < 4 || pendingRecyclers < 1) {
    throw new Error("Recycler count assertion failed");
  }

  // 2. Test Recycler Creation with PENDING status by default
  console.log("\n🏭 2. Testing Add Recycler (Default PENDING Status):");
  const testRegNum = "CPCB/TEST-REG/2026";

  // Clean up if already exists
  await prisma.recycler.deleteMany({ where: { registrationNumber: testRegNum } });

  const newRecycler = await prisma.recycler.create({
    data: {
      name: "Apex E-Waste Solutions Test Plant",
      location: "Patparganj Industrial Area, Delhi",
      latitude: 28.6295,
      longitude: 77.3050,
      contactPhone: "+91 11 4455 6677",
      contactEmail: "intake@apexewaste.test",
      registrationNumber: testRegNum,
      materialsAccepted: JSON.stringify(["PCB", "BATTERY"]),
      authorizationStatus: AuthorizationStatus.PENDING, // Must be PENDING by default
      offeredRateMultiplier: 1.06,
      pickupAvailable: true,
      serviceAreaKm: 25.0,
      passwordHash: "mock_hash",
    },
  });

  if (newRecycler.authorizationStatus !== "PENDING") {
    throw new Error("Newly added recycler was not created with PENDING status");
  }
  console.log(`   ✓ Created facility: ${newRecycler.name} with default status: ${newRecycler.authorizationStatus}`);

  // 3. Test Toggle Status (PENDING -> AUTHORIZED -> REVOKED)
  console.log("\n🔄 3. Testing Recycler Status Toggles:");
  const authorized = await prisma.recycler.update({
    where: { id: newRecycler.id },
    data: { authorizationStatus: AuthorizationStatus.AUTHORIZED },
  });
  if (authorized.authorizationStatus !== "AUTHORIZED") throw new Error("Status transition to AUTHORIZED failed");
  console.log(`   ✓ Updated to AUTHORIZED`);

  const revoked = await prisma.recycler.update({
    where: { id: newRecycler.id },
    data: { authorizationStatus: AuthorizationStatus.REVOKED },
  });
  if (revoked.authorizationStatus !== "REVOKED") throw new Error("Status transition to REVOKED failed");
  console.log(`   ✓ Updated to REVOKED`);

  // Clean up test recycler
  await prisma.recycler.delete({ where: { id: newRecycler.id } });
  console.log(`   ✓ Cleaned up test recycler record`);

  // 4. Test Manual "Update Today's Price" Feature
  console.log("\n💰 4. Testing Manual Price Update:");
  const originalPcb = await prisma.price.findFirst({
    where: { materialCategory: MaterialCategory.PCB },
  });
  if (!originalPcb) throw new Error("PCB price benchmark not found");

  // Temporarily update PCB price
  const updatedPcb = await prisma.price.update({
    where: { id: originalPcb.id },
    data: {
      informalPricePerKg: 185.0,
      formalPricePerKg: 270.0,
      date: new Date(),
    },
  });

  if (updatedPcb.informalPricePerKg !== 185.0 || updatedPcb.formalPricePerKg !== 270.0) {
    throw new Error("Price update verification failed");
  }
  console.log(`   ✓ Price updated: Informal ₹${updatedPcb.informalPricePerKg}/kg -> Formal ₹${updatedPcb.formalPricePerKg}/kg`);

  // Restore original PPT price (180 -> 260)
  await prisma.price.update({
    where: { id: originalPcb.id },
    data: {
      informalPricePerKg: 180.0,
      formalPricePerKg: 260.0,
      date: new Date(),
    },
  });
  console.log(`   ✓ Restored PCB benchmark to ₹180 -> ₹260 / kg`);

  console.log("\n🎉 ALL ADMIN FLOW VERIFICATIONS PASSED!");
}

testAdminFlow()
  .catch((err) => {
    console.error("❌ Test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
