import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";
import { PreferredLanguage } from "@/types";

export async function POST(request: Request) {
  try {
    const { phone, otp } = await request.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { error: "Phone and OTP are required" },
        { status: 400 }
      );
    }

    const cleanOtp = String(otp).trim();
    // For demo: ALWAYS accept the code "4912"
    if (cleanOtp !== "4912") {
      return NextResponse.json(
        { error: "Invalid OTP. Use demo code 4912." },
        { status: 401 }
      );
    }

    // Format phone: strip nondigits
    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length < 10) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit mobile number" },
        { status: 400 }
      );
    }

    const formattedPhone = digitsOnly.length === 10 ? `+91${digitsOnly}` : `+${digitsOnly}`;

    // Find or create collector
    let collector = await prisma.collector.findFirst({
      where: {
        OR: [
          { phone: formattedPhone },
          { phone: digitsOnly },
          { phone: `+91${digitsOnly.slice(-10)}` },
        ],
      },
    });

    if (!collector) {
      collector = await prisma.collector.create({
        data: {
          phone: formattedPhone,
          name: `Collector ${digitsOnly.slice(-4)}`,
          preferredLanguage: PreferredLanguage.HI,
          generalLocation: "Delhi NCR Scrap Hub",
        },
      });
    }

    await setSessionCookie({
      role: "COLLECTOR",
      userId: collector.id,
      phone: collector.phone,
      name: collector.name || "Kabaadiwala / Scrap Collector",
    });

    return NextResponse.json({
      success: true,
      redirectUrl: "/collector/home",
    });
  } catch (error) {
    console.error("Collector auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed. Please try again." },
      { status: 500 }
    );
  }
}
