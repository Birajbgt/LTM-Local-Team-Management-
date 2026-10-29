import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  { prefix: "/dashboard", roles: ["admin", "team", "player"] },
  { prefix: "/dashboard/admin", roles: ["admin"] },
  { prefix: "/dashboard/team", roles: ["admin", "team"] },
  { prefix: "/dashboard/player", roles: ["admin", "player"] },
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/login") {
    return NextResponse.next();
  }

  const isProtected = protectedRoutes.some(
    (route) => pathname === route.prefix || pathname.startsWith(`${route.prefix}/`),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;

  if (!token) {
    const target = new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url);
    return NextResponse.redirect(target);
  }

  try {
    const authResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!authResponse.ok) {
      const target = new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url);
      return NextResponse.redirect(target);
    }

    const user = (await authResponse.json()) as { role?: string };
    const role = String(user.role ?? "").toLowerCase();
    const route = protectedRoutes.find(
      (item) => pathname === item.prefix || pathname.startsWith(`${item.prefix}/`),
    );

    if (!route || !role || !route.roles.includes(role)) {
      const target = new URL("/dashboard", request.url);
      return NextResponse.redirect(target);
    }
  } catch {
    const target = new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url);
    return NextResponse.redirect(target);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/login"],
};
