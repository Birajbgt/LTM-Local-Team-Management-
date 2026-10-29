import { cookies } from "next/headers";

export type UserRole = "admin" | "team" | "player";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  team: "Team / Club",
  player: "Player",
};

export const sessionCookieName = "token";

export function normalizeRole(role: string | undefined): UserRole | null {
  const normalized = role?.trim().toLowerCase();

  if (normalized === "admin") return "admin";
  if (normalized === "team") return "team";
  if (normalized === "player") return "player";

  return null;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(sessionCookieName)?.value;

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const user = (await response.json()) as Partial<SessionUser>;

    const normalizedRole = normalizeRole(String(user.role ?? ""));

    if (!user.id || !user.name || !user.email || !normalizedRole) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: normalizedRole,
    };
  } catch {
    return null;
  }
}

export function isAuthorizedForRoute(pathname: string, role: UserRole) {
  const routeMap: Record<string, UserRole[]> = {
    "/dashboard": ["admin", "team", "player"],
    "/dashboard/admin": ["admin"],
    "/dashboard/team": ["admin", "team"],
    "/dashboard/player": ["admin", "player"],
  };

  const match = Object.entries(routeMap).find(
    ([route]) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (!match) {
    return true;
  }

  return match[1].includes(role);
}
