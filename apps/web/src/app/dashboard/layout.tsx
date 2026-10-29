import Image from "next/image";
import Link from "next/link";

import { getCurrentUser, roleLabels } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentUser();

  return (
    <div className="min-h-screen bg-[#061b2d] text-slate-100">
      <header className="border-b border-[#d9b768]/25 bg-[#061b2d]/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <Image
              src="/logo/ltm.jpg"
              alt="LTM logo"
              width={150}
              height={56}
              className="h-10 w-auto object-contain"
            />
          </div>

          <nav className="hidden items-center gap-4 md:flex">
            <Link
              href="/dashboard"
              className="rounded-full border border-[#d9b768]/20 px-3 py-1.5 text-sm text-slate-200 transition hover:border-[#d9b768] hover:text-[#f2d58a]"
            >
              Overview
            </Link>

            {currentUser?.role === "admin" ? (
              <Link
                href="/dashboard/admin"
                className="rounded-full border border-[#d9b768]/20 px-3 py-1.5 text-sm text-slate-200 transition hover:border-[#d9b768] hover:text-[#f2d58a]"
              >
                Admin
              </Link>
            ) : null}

            {currentUser?.role === "team" ? (
              <Link
                href="/dashboard/team"
                className="rounded-full border border-[#d9b768]/20 px-3 py-1.5 text-sm text-slate-200 transition hover:border-[#d9b768] hover:text-[#f2d58a]"
              >
                Team / Club
              </Link>
            ) : null}

            {currentUser?.role === "player" ? (
              <Link
                href="/dashboard/player"
                className="rounded-full border border-[#d9b768]/20 px-3 py-1.5 text-sm text-slate-200 transition hover:border-[#d9b768] hover:text-[#f2d58a]"
              >
                Player
              </Link>
            ) : null}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Signed in</div>
              <div className="text-sm font-medium text-white">{currentUser?.name ?? "Guest"}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#d9b768]">
                {currentUser ? roleLabels[currentUser.role] : "Guest"}
              </div>
            </div>
            <a
              href="/api/auth/logout"
              className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-200 transition hover:border-[#d9b768] hover:text-[#f2d58a]"
            >
              Logout
            </a>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
