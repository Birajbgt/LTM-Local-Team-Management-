import { NextRequest, NextResponse } from "next/server";

const publicPaths = ["/", "/login"];
const roleAccess: Record<string, string[]> = {
  "/dashboard": ["admin", "team", "player"],
  "/dashboard/admin": ["admin"],
  "/dashboard/team": ["admin", "team"],
  "/dashboard/player": ["admin", "player"],
};

function getRoleFromToken(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const json = Buffer.from(padded, "base64").toString("utf-8");
    const parsed = JSON.parse(json) as { role?: string };
    return parsed.role?.toLowerCase() ?? null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = getRoleFromToken(token);

  if (!role) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const routeMatch = Object.entries(roleAccess).find(
    ([route, allowedRoles]) =>
      pathname === route || pathname.startsWith(`${route}/`),
  );

  if (!routeMatch) {
    return NextResponse.next();
  }

  const allowedRoles = routeMatch[1];

  if (!allowedRoles.includes(role)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
