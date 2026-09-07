import { PrismaClient } from "@prisma/client";
import { MaterialCategory, AuthorizationStatus, PaymentStatus, TransactionStatus, PreferredLanguage } from "../src/types";
import { hashPassword } from "../src/lib/auth-utils";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting RecyConnect database seed...");

  // Clean existing tables in proper order
  await prisma.traceability.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.material.deleteMany();
  await prisma.price.deleteMany();
  await prisma.recycler.deleteMany();
  await prisma.collector.deleteMany();
  await prisma.adminUser.deleteMany();

  console.log("🧹 Existing database records cleared.");

  // 1. Seed Recyclers (4 AUTHORIZED, 1 PENDING)
  // Demo Recycler: greenloop@demo.com / demo1234
  const recyclerGreenLoop = await prisma.recycler.create({
    data: {
      name: "GreenLoop Recycling Solutions",
      location: "Okhla Industrial Area Phase-II, New Delhi",
      latitude: 28.5355,
      longitude: 77.2711,
      materialsAccepted: JSON.stringify(["PCB", "BATTERY", "CABLE", "MOTOR_MAGNET"]),
      authorizationStatus: AuthorizationStatus.AUTHORIZED,
      registrationNumber: "REG/EW-2023/DL-0881",
      contactPhone: "+91 11 2638 4901",
      contactEmail: "greenloop@demo.com",
      offeredRateMultiplier: 1.08, // +8% bonus above formal rate
      pickupAvailable: true,
      serviceAreaKm: 35.0,
      passwordHash: hashPassword("demo1234"),
    },
  });

  const recyclerGreen = await prisma.recycler.create({
    data: {
      name: "GreenCircuits India Ltd",
      location: "Sector 63, Electronic City, Noida, UP",
      latitude: 28.6280,
      longitude: 77.3780,
      materialsAccepted: JSON.stringify(["PCB", "CRT_LCD", "MIXED_PLASTIC"]),
      authorizationStatus: AuthorizationStatus.AUTHORIZED,
      registrationNumber: "UPPCB/REG-EW-2022/419",
      contactPhone: "+91 120 458 9200",
      contactEmail: "procurement@greencircuits.co.in",
      offeredRateMultiplier: 1.05, // +5%
      pickupAvailable: true,
      serviceAreaKm: 25.0,
      passwordHash: hashPassword("demo1234"),
    },
  });

  const recyclerShakti = await prisma.recycler.create({
    data: {
      name: "Shakti Metal & Rare Earth Recoveries",
      location: "Mayapuri Industrial Area Phase-I, Delhi",
      latitude: 28.6340,
      longitude: 77.1260,
      materialsAccepted: JSON.stringify(["MOTOR_MAGNET", "CABLE", "PCB"]),
      authorizationStatus: AuthorizationStatus.AUTHORIZED,
      registrationNumber: "REG-AUTH/2021/7732",
      contactPhone: "+91 98100 44211",
      contactEmail: "info@shaktimetals.com",
      offeredRateMultiplier: 1.10, // +10%
      pickupAvailable: false, // Drop-off only
      serviceAreaKm: 15.0,
      passwordHash: hashPassword("demo1234"),
    },
  });

  const recyclerBharat = await prisma.recycler.create({
    data: {
      name: "Bharat Battery Re-cyclers",
      location: "Site IV Industrial Area, Sahibabad, Ghaziabad",
      latitude: 28.6720,
      longitude: 77.3480,
      materialsAccepted: JSON.stringify(["BATTERY", "MIXED_PLASTIC"]),
      authorizationStatus: AuthorizationStatus.AUTHORIZED,
      registrationNumber: "REG-BATT/2023/1102",
      contactPhone: "+91 99112 88344",
      contactEmail: "collection@bharatbattery.org",
      offeredRateMultiplier: 1.07, // +7%
      pickupAvailable: true,
      serviceAreaKm: 40.0,
      passwordHash: hashPassword("demo1234"),
    },
  });

  const recyclerUrbanPending = await prisma.recycler.create({
    data: {
      name: "UrbanMetals Refiners",
      location: "Sector 3, Bawana Industrial Area, Delhi",
      latitude: 28.7950,
      longitude: 77.0420,
      materialsAccepted: JSON.stringify(["PCB", "CABLE"]),
      authorizationStatus: AuthorizationStatus.PENDING, // PENDING for Admin review
      registrationNumber: "REG-APPL/2024/9914",
      contactPhone: "+91 98711 00293",
      contactEmail: "urbanmetals.delhi@gmail.com",
      offeredRateMultiplier: 1.02,
      pickupAvailable: false,
      serviceAreaKm: 20.0,
      passwordHash: hashPassword("demo1234"),
    },
  });

  console.log("✅ Seeded 5 Recyclers (4 AUTHORIZED, 1 PENDING, including demo account greenloop@demo.com)");

  // 2. Seed Admin User (admin@demo.com / admin1234)
  const adminUser = await prisma.adminUser.create({
    data: {
      email: "admin@demo.com",
      name: "Administrator",
      password: hashPassword("admin1234"),
    },
  });
  console.log("✅ Seeded Admin User (admin@demo.com)");

  // 3. Seed Prices for all 6 categories (Exact numbers per brief/PPT)
  // PCB ₹180→₹260, Battery ₹90→₹145, Cable ₹60→₹95, CRT/LCD ₹20→₹55, Motor/Magnet ₹110→₹170, Mixed Plastic ₹12→₹22
  // 3. Seed Prices for all 6 categories with realistic subcategories and market ranges
  const priceData = [
    // PCB
    {
      materialCategory: MaterialCategory.PCB,
      subCategory: "High-Grade Server & Telecom Cards",
      location: "Delhi NCR Scrap Hub",
      informalPricePerKg: 180.0,
      formalPricePerKg: 260.0,
      priceMin: 160.0,
      priceMax: 300.0,
      unit: "kg",
      recyclerId: recyclerGreenLoop.id,
    },
    {
      materialCategory: MaterialCategory.PCB,
      subCategory: "Consumer Appliance & TV Motherboards",
      location: "Delhi NCR Scrap Hub",
      informalPricePerKg: 110.0,
      formalPricePerKg: 165.0,
      priceMin: 95.0,
      priceMax: 185.0,
      unit: "kg",
      recyclerId: recyclerGreen.id,
    },
    // BATTERY (e.g. Lithium-ion vs Lead-acid)
    {
      materialCategory: MaterialCategory.BATTERY,
      subCategory: "Lead-Acid (UPS & Automotive)",
      location: "Delhi NCR Scrap Hub",
      informalPricePerKg: 90.0,
      formalPricePerKg: 145.0,
      priceMin: 80.0,
      priceMax: 160.0,
      unit: "kg",
      recyclerId: recyclerBharat.id,
    },
    {
      materialCategory: MaterialCategory.BATTERY,
      subCategory: "Lithium-Ion (EV & Smartphone Packs)",
      location: "Delhi NCR Scrap Hub",
      informalPricePerKg: 150.0,
      formalPricePerKg: 240.0,
      priceMin: 135.0,
      priceMax: 270.0,
      unit: "kg",
      recyclerId: recyclerBharat.id,
    },
    // CABLE
    {
      materialCategory: MaterialCategory.CABLE,
      subCategory: "Heavy Industrial Copper Wiring",
      location: "Delhi NCR Scrap Hub",
      informalPricePerKg: 60.0,
      formalPricePerKg: 95.0,
      priceMin: 50.0,
      priceMax: 115.0,
      unit: "kg",
      recyclerId: recyclerShakti.id,
    },
    {
      materialCategory: MaterialCategory.CABLE,
      subCategory: "Data & Appliance Flexible Wiring",
      location: "Delhi NCR Scrap Hub",
      informalPricePerKg: 35.0,
      formalPricePerKg: 60.0,
      priceMin: 30.0,
      priceMax: 75.0,
      unit: "kg",
      recyclerId: recyclerShakti.id,
    },
    // CRT / LCD
    {
      materialCategory: MaterialCategory.CRT_LCD,
      subCategory: "LCD & LED Flat Panels",
      location: "Delhi NCR Scrap Hub",
      informalPricePerKg: 20.0,
      formalPricePerKg: 55.0,
      priceMin: 15.0,
      priceMax: 65.0,
      unit: "kg",
      recyclerId: recyclerGreen.id,
    },
    {
      materialCategory: MaterialCategory.CRT_LCD,
      subCategory: "Cathode Ray Tube Glass Funnels",
      location: "Delhi NCR Scrap Hub",
      informalPricePerKg: 10.0,
      formalPricePerKg: 28.0,
      priceMin: 8.0,
      priceMax: 35.0,
      unit: "kg",
      recyclerId: recyclerGreen.id,
    },
    // MOTOR & MAGNET
    {
      materialCategory: MaterialCategory.MOTOR_MAGNET,
      subCategory: "Rare-Earth Neodymium HDD Magnets",
      location: "Delhi NCR Scrap Hub",
      informalPricePerKg: 110.0,
      formalPricePerKg: 170.0,
      priceMin: 95.0,
      priceMax: 200.0,
      unit: "kg",
      recyclerId: recyclerShakti.id,
    },
    {
      materialCategory: MaterialCategory.MOTOR_MAGNET,
      subCategory: "Induction Stator Motor Assemblies",
      location: "Delhi NCR Scrap Hub",
      informalPricePerKg: 65.0,
      formalPricePerKg: 105.0,
      priceMin: 55.0,
      priceMax: 125.0,
      unit: "kg",
      recyclerId: recyclerShakti.id,
    },
    // MIXED PLASTIC
    {
      materialCategory: MaterialCategory.MIXED_PLASTIC,
      subCategory: "Clean ABS & HIPS Device Casings",
      location: "Delhi NCR Scrap Hub",
      informalPricePerKg: 12.0,
      formalPricePerKg: 22.0,
      priceMin: 10.0,
      priceMax: 28.0,
      unit: "kg",
      recyclerId: recyclerGreen.id,
    },
    {
      materialCategory: MaterialCategory.MIXED_PLASTIC,
      subCategory: "Shredded Polymer & Flame-Retardant Mix",
      location: "Delhi NCR Scrap Hub",
      informalPricePerKg: 7.0,
      formalPricePerKg: 14.0,
      priceMin: 5.0,
      priceMax: 18.0,
      unit: "kg",
      recyclerId: recyclerBharat.id,
    },
  ];

  for (const p of priceData) {
    await prisma.price.create({ data: p });
  }

  // Seed historical price records from 7 days ago to enable trend derivation
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const historicalPriceData = [
    { materialCategory: MaterialCategory.PCB, subCategory: "High-Grade Server & Telecom Cards", location: "Delhi NCR Scrap Hub", informalPricePerKg: 175.0, formalPricePerKg: 250.0, priceMin: 155.0, priceMax: 290.0, unit: "kg", date: oneWeekAgo },
    { materialCategory: MaterialCategory.BATTERY, subCategory: "Lead-Acid (UPS & Automotive)", location: "Delhi NCR Scrap Hub", informalPricePerKg: 95.0, formalPricePerKg: 150.0, priceMin: 85.0, priceMax: 165.0, unit: "kg", date: oneWeekAgo },
    { materialCategory: MaterialCategory.CABLE, subCategory: "Heavy Industrial Copper Wiring", location: "Delhi NCR Scrap Hub", informalPricePerKg: 55.0, formalPricePerKg: 90.0, priceMin: 45.0, priceMax: 105.0, unit: "kg", date: oneWeekAgo },
    { materialCategory: MaterialCategory.CRT_LCD, subCategory: "LCD & LED Flat Panels", location: "Delhi NCR Scrap Hub", informalPricePerKg: 20.0, formalPricePerKg: 55.0, priceMin: 15.0, priceMax: 65.0, unit: "kg", date: oneWeekAgo },
    { materialCategory: MaterialCategory.MOTOR_MAGNET, subCategory: "Rare-Earth Neodymium HDD Magnets", location: "Delhi NCR Scrap Hub", informalPricePerKg: 105.0, formalPricePerKg: 160.0, priceMin: 90.0, priceMax: 190.0, unit: "kg", date: oneWeekAgo },
    { materialCategory: MaterialCategory.MIXED_PLASTIC, subCategory: "Clean ABS & HIPS Device Casings", location: "Delhi NCR Scrap Hub", informalPricePerKg: 14.0, formalPricePerKg: 24.0, priceMin: 11.0, priceMax: 30.0, unit: "kg", date: oneWeekAgo },
  ];

  for (const hp of historicalPriceData) {
    await prisma.price.create({ data: hp });
  }

  console.log("✅ Seeded Benchmark Price Records with subcategories & market ranges + 6 Historical Records");

  // 4. Seed Sample Materials catalog items
  await prisma.material.createMany({
    data: [
      {
        category: MaterialCategory.PCB,
        subCategory: "High-Grade Server & Telecom Cards",
        description: "Motherboards, telecom server cards & RAM IC boards",
        weightKg: 24.5,
        condition: "De-soldered / Clean boards",
        sourceType: "Electronic repair & IT dismantling",
        estimatedValue: 6370.0,
      },
      {
        category: MaterialCategory.BATTERY,
        subCategory: "Lithium-Ion (EV & Smartphone Packs)",
        description: "Assorted UPS Lead-acid & Mobile Li-ion packs",
        weightKg: 42.0,
        condition: "Intact housing, sealed terminals",
        sourceType: "Auto electric & UPS replacements",
        estimatedValue: 6090.0,
      },
      {
        category: MaterialCategory.CABLE,
        subCategory: "Heavy Industrial Copper Wiring",
        description: "Copper core flexible wiring & appliance cords",
        weightKg: 18.0,
        condition: "Stripped & bundled",
        sourceType: "Demolition & electrical maintenance",
        estimatedValue: 1710.0,
      },
      {
        category: MaterialCategory.CRT_LCD,
        subCategory: "LCD & LED Flat Panels",
        description: "LCD laptop panels and desktop display glass",
        weightKg: 35.0,
        condition: "Unbroken display modules",
        sourceType: "Corporate e-waste bulk lot",
        estimatedValue: 1925.0,
      },
      {
        category: MaterialCategory.MOTOR_MAGNET,
        subCategory: "Rare-Earth Neodymium HDD Magnets",
        description: "Hard drive neodymium magnets & induction motors",
        weightKg: 15.0,
        condition: "Extracted magnetic assemblies",
        sourceType: "Server scrap extraction",
        estimatedValue: 2550.0,
      },
      {
        category: MaterialCategory.MIXED_PLASTIC,
        subCategory: "Clean ABS & HIPS Device Casings",
        description: "ABS/HIPS printer and monitor chassis casings",
        weightKg: 50.0,
        condition: "Crushed & segregated",
        sourceType: "Appliance repair shops",
        estimatedValue: 1100.0,
      },
    ],
  });

  console.log("✅ Seeded Sample Material Records");

  // 5. Seed Collectors
  const collectorRamesh = await prisma.collector.create({
    data: {
      name: "Ramesh Kumar",
      phone: "+919876543210",
      preferredLanguage: PreferredLanguage.HI,
      generalLocation: "Seelampur Market, North East Delhi",
    },
  });

  const collectorSalim = await prisma.collector.create({
    data: {
      name: "Salim Khan",
      phone: "+919811223344",
      preferredLanguage: PreferredLanguage.HI,
      generalLocation: "Mustafabad / Karawal Nagar, Delhi",
    },
  });

  const collectorSunita = await prisma.collector.create({
    data: {
      name: "Sunita Devi",
      phone: "+919899887766",
      preferredLanguage: PreferredLanguage.EN,
      generalLocation: "Mayapuri Scrap Hub, West Delhi",
    },
  });

  console.log("✅ Seeded 3 Sample Collectors");

  // 6. Seed Transactions & Traceability Records
  // Transaction 1: Fully Completed and Verified (L-0088)
  const txCompleted = await prisma.transaction.create({
    data: {
      lotId: "L-0088",
      collectorId: collectorRamesh.id,
      recyclerId: recyclerGreenLoop.id,
      materialCategory: MaterialCategory.PCB,
      weightKg: 24.5,
      quotedValue: 6370.0,
      finalValue: 6500.0,
      collectionLocation: "Seelampur Scrap Mandi, Gate 2",
      handoverLocation: "GreenLoop Depot, Okhla Phase II",
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: "DIGITAL",
      transactionStatus: TransactionStatus.COMPLETED,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    },
  });

  await prisma.traceability.create({
    data: {
      transactionId: txCompleted.id,
      photoUrls: JSON.stringify([
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80",
        "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=500&q=80",
      ]),
      weightKg: 24.5,
      timestampAtPickup: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      latitude: 28.5355,
      longitude: 77.2711,
      handoverReference: "REF-OKH-8821",
      recyclerConfirmedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      otpCode: "4821",
    },
  });

  // Transaction 2: Handed Over to GreenLoop, awaiting final weight verification (L-0089)
  const txHandedOver = await prisma.transaction.create({
    data: {
      lotId: "L-0089",
      collectorId: collectorSalim.id,
      recyclerId: recyclerGreenLoop.id,
      materialCategory: MaterialCategory.BATTERY,
      weightKg: 42.0,
      quotedValue: 6577.0, // 42 * 145 * 1.08
      finalValue: null,
      collectionLocation: "Karawal Nagar Chauraha",
      handoverLocation: "GreenLoop Collection Van #DL-1L-4421",
      paymentStatus: PaymentStatus.PENDING,
      transactionStatus: TransactionStatus.HANDED_OVER,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
  });

  await prisma.traceability.create({
    data: {
      transactionId: txHandedOver.id,
      photoUrls: JSON.stringify([
        "https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?w=500&q=80",
      ]),
      weightKg: 42.0,
      timestampAtPickup: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      latitude: 28.5355,
      longitude: 77.2711,
      handoverReference: "REF-BAT-8942",
      recyclerConfirmedAt: null,
      otpCode: "7392",
    },
  });

  // Transaction 3: Matched with GreenLoop, scheduled for van pickup (L-0090)
  const txMatched = await prisma.transaction.create({
    data: {
      lotId: "L-0090",
      collectorId: collectorSunita.id,
      recyclerId: recyclerGreenLoop.id,
      materialCategory: MaterialCategory.CABLE,
      weightKg: 18.0,
      quotedValue: 1847.0, // 18 * 95 * 1.08
      finalValue: null,
      collectionLocation: "Mayapuri Phase 1, Gali 4",
      handoverLocation: "GreenLoop Okhla Depot Gate 2",
      paymentStatus: PaymentStatus.PENDING,
      transactionStatus: TransactionStatus.MATCHED,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    },
  });

  await prisma.traceability.create({
    data: {
      transactionId: txMatched.id,
      photoUrls: JSON.stringify([
        "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=500&q=80",
      ]),
      weightKg: 18.0,
      timestampAtPickup: new Date(Date.now() - 6 * 60 * 60 * 1000),
      latitude: 28.6340,
      longitude: 77.1260,
      handoverReference: "REF-CAB-9018",
      recyclerConfirmedAt: null,
      otpCode: "3814",
    },
  });

  // Transaction 4: Freshly Quoted Lot, awaiting recycler acceptance (L-0091)
  await prisma.transaction.create({
    data: {
      lotId: "L-0091",
      collectorId: collectorRamesh.id,
      recyclerId: null,
      materialCategory: MaterialCategory.CRT_LCD,
      weightKg: 35.0,
      quotedValue: 1925.0,
      finalValue: null,
      collectionLocation: "Seelampur Old Bus Terminal",
      handoverLocation: null,
      paymentStatus: PaymentStatus.PENDING,
      transactionStatus: TransactionStatus.QUOTED,
      createdAt: new Date(),
    },
  });

  console.log("✅ Seeded 4 Transactions & 3 Traceability Handover Logs (L-0088 to L-0091)");

  console.log("🚀 Database seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
