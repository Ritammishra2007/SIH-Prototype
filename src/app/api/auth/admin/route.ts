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

    const admin = await prisma.adminUser.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!admin) {
      // Fallback demo check if adminUser was wiped or before seed
      if (normalizedEmail === "admin@demo.com" && password === "admin1234") {
        await setSessionCookie({
          role: "ADMIN",
          userId: "admin-demo-default",
          email: "admin@demo.com",
          name: "Admin",
        });
        return NextResponse.json({
          success: true,
          redirectUrl: "/admin/dashboard",
        });
      }

      return NextResponse.json(
        { error: "Invalid credentials. For demo, use admin@demo.com / admin1234" },
        { status: 401 }
      );
    }

    const isMatch =
      verifyPassword(password, admin.password) ||
      (password === "admin1234" && normalizedEmail === "admin@demo.com");

    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid password. For demo, use admin1234" },
        { status: 401 }
      );
    }

    await setSessionCookie({
      role: "ADMIN",
      userId: admin.id,
      email: admin.email,
      name: admin.name,
    });

    return NextResponse.json({
      success: true,
      redirectUrl: "/admin/dashboard",
    });
  } catch (error) {
    console.error("Admin auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed. Please try again." },
      { status: 500 }
    );
  }
}
