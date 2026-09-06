import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/session";

const COOKIE_NAME = "recyconnect_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  // 1. Collector routes
  if (pathname.startsWith("/collector")) {
    if (pathname === "/collector/login") {
      if (session && session.role === "COLLECTOR") {
        return NextResponse.redirect(new URL("/collector/home", request.url));
      }
      return NextResponse.next();
    }

    if (!session || session.role !== "COLLECTOR") {
      return NextResponse.redirect(new URL("/collector/login", request.url));
    }
    return NextResponse.next();
  }

  // 2. Recycler routes
  if (pathname.startsWith("/recycler")) {
    if (pathname === "/recycler/login") {
      if (session && session.role === "RECYCLER") {
        return NextResponse.redirect(new URL("/recycler/dashboard", request.url));
      }
      return NextResponse.next();
    }

    if (!session || session.role !== "RECYCLER") {
      return NextResponse.redirect(new URL("/recycler/login", request.url));
    }
    return NextResponse.next();
  }

  // 3. Admin routes
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      if (session && session.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
      return NextResponse.next();
    }

    if (!session || session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/collector/:path*",
    "/recycler/:path*",
    "/admin/:path*",
  ],
};
