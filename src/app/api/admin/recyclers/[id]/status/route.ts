import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AuthorizationStatus } from "@/types";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { status } = await request.json();

    if (!status || !["AUTHORIZED", "PENDING", "REVOKED"].includes(status)) {
      return NextResponse.json(
        { error: "Valid status required: AUTHORIZED, PENDING, or REVOKED" },
        { status: 400 }
      );
    }

    const updated = await prisma.recycler.update({
      where: { id },
      data: {
        authorizationStatus: status,
      },
    });

    return NextResponse.json({
      success: true,
      recycler: updated,
    });
  } catch (error) {
    console.error("Update recycler status error:", error);
    return NextResponse.json(
      { error: "Failed to update recycler status" },
      { status: 500 }
    );
  }
}
