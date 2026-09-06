import { prisma } from "../src/lib/prisma";
import { verifyPassword } from "../src/lib/auth-utils";
import { createSessionToken, verifySessionToken } from "../src/lib/session";

async function verify() {
  console.log("🔍 Running RecyConnect Core Verification...");

  // 1. Check Model Counts
  const materialsCount = await prisma.material.count();
  const pricesCount = await prisma.price.count();
  const recyclersCount = await prisma.recycler.count();
  const authorizedRecyclers = await prisma.recycler.count({ where: { authorizationStatus: "AUTHORIZED" } });
  const pendingRecyclers = await prisma.recycler.count({ where: { authorizationStatus: "PENDING" } });
  const collectorsCount = await prisma.collector.count();
  const transactionsCount = await prisma.transaction.count();
  const traceabilityCount = await prisma.traceability.count();
  const adminCount = await prisma.adminUser.count();

  console.log("\n📊 Database Model Counts:");
  console.log(`- Materials: ${materialsCount} (expected: 6)`);
  console.log(`- Prices: ${pricesCount} (expected: 6)`);
  console.log(`- Recyclers: ${recyclersCount} (${authorizedRecyclers} AUTHORIZED, ${pendingRecyclers} PENDING)`);
  console.log(`- Collectors: ${collectorsCount} (expected: 3+)`);
  console.log(`- Transactions: ${transactionsCount} (expected: 4)`);
  console.log(`- Traceability Records: ${traceabilityCount} (expected: 2)`);
  console.log(`- Admin Users: ${adminCount} (expected: 1+)`);

  // Assert counts
  if (pricesCount < 6 || recyclersCount < 5 || pendingRecyclers < 1 || transactionsCount < 4) {
    throw new Error("Seed verification failed: Incomplete seed dataset!");
  }

  // 2. Verify Exact Price Spreads per PPT
  console.log("\n💰 Checking PPT Benchmark Price Spreads:");
  const prices = await prisma.price.findMany();
  const expectedPrices: Record<string, { informal: number; formal: number }> = {
    PCB: { informal: 180, formal: 260 },
    BATTERY: { informal: 90, formal: 145 },
    CABLE: { informal: 60, formal: 95 },
    CRT_LCD: { informal: 20, formal: 55 },
    MOTOR_MAGNET: { informal: 110, formal: 170 },
    MIXED_PLASTIC: { informal: 12, formal: 22 },
  };

  for (const p of prices) {
    const exp = expectedPrices[p.materialCategory];
    if (exp) {
      if (p.informalPricePerKg !== exp.informal || p.formalPricePerKg !== exp.formal) {
        throw new Error(`Price mismatch for ${p.materialCategory}: got ${p.informalPricePerKg}->${p.formalPricePerKg}, expected ${exp.informal}->${exp.formal}`);
      }
      console.log(`  ✓ ${p.materialCategory.padEnd(14)}: ₹${p.informalPricePerKg} → ₹${p.formalPricePerKg} / kg`);
    }
  }

  // 3. Verify Recycler Demo Account
  console.log("\n🏭 Verifying Recycler Demo Account:");
  const demoRecycler = await prisma.recycler.findFirst({
    where: { contactEmail: "greenloop@demo.com" },
  });
  if (!demoRecycler) {
    throw new Error("Demo recycler greenloop@demo.com not found!");
  }
  const recyclerPwOk = verifyPassword("demo1234", demoRecycler.passwordHash);
  if (!recyclerPwOk) {
    throw new Error("Password verification failed for greenloop@demo.com / demo1234");
  }
  console.log(`  ✓ Recycler found: ${demoRecycler.name} (${demoRecycler.contactEmail}), Password hash verified.`);

  // 4. Verify Admin Demo Account
  console.log("\n🛡️ Verifying Admin Demo Account:");
  const demoAdmin = await prisma.adminUser.findUnique({
    where: { email: "admin@demo.com" },
  });
  if (!demoAdmin) {
    throw new Error("Demo admin admin@demo.com not found!");
  }
  const adminPwOk = verifyPassword("admin1234", demoAdmin.password);
  if (!adminPwOk) {
    throw new Error("Password verification failed for admin@demo.com / admin1234");
  }
  console.log(`  ✓ Admin found: ${demoAdmin.name} (${demoAdmin.email}), Password hash verified.`);

  // 5. Test Web Crypto Session System
  console.log("\n🔐 Verifying Signed Session Token Engine:");
  const collectorToken = await createSessionToken({
    role: "COLLECTOR",
    userId: "test-collector-id",
    phone: "+919876543210",
  });
  const decoded = await verifySessionToken(collectorToken);
  if (!decoded || decoded.role !== "COLLECTOR" || decoded.phone !== "+919876543210") {
    throw new Error("Session token verification failed!");
  }
  console.log("  ✓ Session Token signed and verified successfully via Web Crypto HMAC-SHA256.");

  console.log("\n🎉 ALL TESTS PASSED! Ready for internal demo.");
}

verify()
  .catch((err) => {
    console.error("❌ Verification failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
