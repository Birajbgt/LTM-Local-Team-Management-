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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">LTM</p>
          </div>

          <nav className="hidden items-center gap-4 md:flex">
            <Link
              href="/dashboard"
              className="rounded-full border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition hover:border-emerald-500 hover:text-emerald-300"
            >
              Overview
            </Link>
            <Link
              href="/dashboard/admin"
              className="rounded-full border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition hover:border-emerald-500 hover:text-emerald-300"
            >
              Admin
            </Link>
            <Link
              href="/dashboard/team"
              className="rounded-full border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition hover:border-emerald-500 hover:text-emerald-300"
            >
              Team / Club
            </Link>
            <Link
              href="/dashboard/player"
              className="rounded-full border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition hover:border-emerald-500 hover:text-emerald-300"
            >
              Player
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Signed in</div>
              <div className="text-sm font-medium text-white">{currentUser?.name ?? "Guest"}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-400">
                {currentUser ? roleLabels[currentUser.role] : "Guest"}
              </div>
            </div>
            <a
              href="/api/auth/logout"
              className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-200 transition hover:border-slate-500"
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
