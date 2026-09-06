import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Haversine formula to compute great-circle distance in km
function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const collectorLat = parseFloat(searchParams.get("lat") || "28.6692");
    const collectorLng = parseFloat(searchParams.get("lng") || "77.2628");

    // Fetch ONLY AUTHORIZED recyclers per brief
    const authorizedRecyclers = await prisma.recycler.findMany({
      where: {
        authorizationStatus: "AUTHORIZED",
      },
    });

    const rankedRecyclers = authorizedRecyclers
      .map((rec) => {
        let acceptedList: string[] = [];
        try {
          acceptedList = JSON.parse(rec.materialsAccepted);
        } catch {
          acceptedList = [];
        }

        const acceptsMaterial = category ? acceptedList.includes(category) : true;
        const distanceKm = calculateDistanceKm(
          collectorLat,
          collectorLng,
          rec.latitude,
          rec.longitude
        );

        // Score formula combining distance and offered rate bonus
        // Higher multiplier gives positive points, distance subtracts points
        const rateBonusPercent = Math.round((rec.offeredRateMultiplier - 1.0) * 100);
        const score =
          (rec.offeredRateMultiplier * 100) -
          (distanceKm * 1.5) +
          (rec.pickupAvailable ? 10 : 0);

        return {
          id: rec.id,
          name: rec.name,
          location: rec.location,
          latitude: rec.latitude,
          longitude: rec.longitude,
          distanceKm,
          authorizationStatus: rec.authorizationStatus,
          registrationNumber: rec.registrationNumber,
          offeredRateMultiplier: rec.offeredRateMultiplier,
          rateBonusPercent,
          pickupAvailable: rec.pickupAvailable,
          serviceAreaKm: rec.serviceAreaKm,
          acceptsMaterial,
          contactPhone: rec.contactPhone,
          contactEmail: rec.contactEmail,
          score,
        };
      })
      .sort((a, b) => b.score - a.score);

    return NextResponse.json(rankedRecyclers);
  } catch (error) {
    console.error("Recycler match error:", error);
    return NextResponse.json(
      { error: "Failed to match recyclers" },
      { status: 500 }
    );
  }
}
