import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "COLLECTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { language } = await request.json();
    if (language !== "EN" && language !== "HI" && language !== "MR") {
      return NextResponse.json({ error: "Invalid language" }, { status: 400 });
    }

    await prisma.collector.update({
      where: { id: session.userId },
      data: { preferredLanguage: language },
    });

    return NextResponse.json({ success: true, language });
  } catch (error) {
    console.error("Failed to update language:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
