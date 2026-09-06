import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";
import { verifyPassword } from "@/lib/auth-utils";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const recycler = await prisma.recycler.findFirst({
      where: {
        contactEmail: {
          equals: normalizedEmail,
        },
      },
    });

    if (!recycler) {
      return NextResponse.json(
        { error: "Invalid credentials. For demo, use greenloop@demo.com / demo1234" },
        { status: 401 }
      );
    }

    const isMatch =
      verifyPassword(password, recycler.passwordHash) ||
      (password === "demo1234" && normalizedEmail === "greenloop@demo.com");

    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid password. For demo, use demo1234" },
        { status: 401 }
      );
    }

    await setSessionCookie({
      role: "RECYCLER",
      userId: recycler.id,
      email: recycler.contactEmail,
      name: recycler.name,
    });

    return NextResponse.json({
      success: true,
      redirectUrl: "/recycler/dashboard",
    });
  } catch (error) {
    console.error("Recycler auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed. Please try again." },
      { status: 500 }
    );
  }
}
