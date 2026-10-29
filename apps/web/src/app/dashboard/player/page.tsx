import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getCurrentUser, roleLabels } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PlayerDashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const token = (await cookies()).get("token")?.value;
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  let players: Array<{ id: string; name: string; role?: string; team?: { name?: string } | null }> = [];

  if (token) {
    const response = await fetch(`${apiBaseUrl}/api/players`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (response.ok) {
      const payload = (await response.json()) as Array<{
        id?: string;
        name?: string;
        role?: string;
        team?: { name?: string } | null;
      }>;

      players = (payload ?? [])
        .filter((player): player is { id: string; name: string; role?: string; team?: { name?: string } | null } => Boolean(player.id && player.name))
        .map((player) => ({
          id: player.id,
          name: player.name,
          role: player.role,
          team: player.team ?? null,
        }));
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 rounded-3xl border border-violet-500/30 bg-violet-500/10 p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-violet-300">
          {roleLabels[currentUser.role]} Panel
        </p>
        <h1 className="mt-3 text-3xl font-bold text-white">Welcome back, {currentUser.name}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { title: "My stats", text: "Review goals, fitness, and match performance reports." },
          { title: "Request upgrade", text: "Submit a stat correction or performance improvement request." },
          { title: "Admin review", text: "Await approval from the admin team before final validation." },
        ].map((item) => (
          <article key={item.title} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-xl font-semibold text-white">{item.title}</h2>
            <p className="mt-3 text-slate-300">{item.text}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Players</h2>
          <span className="text-xs uppercase tracking-[0.2em] text-violet-400">Live roster</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {players.length === 0 ? (
            <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4 text-slate-300 md:col-span-2 xl:col-span-3">
              No players found yet.
            </div>
          ) : (
            players.map((player) => (
              <article key={player.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-white">{player.name}</h3>
                  <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-violet-300">
                    {player.role ?? "Player"}
                  </span>
                </div>
                <div className="mt-3 text-sm text-slate-300">
                  {player.team?.name ? `Team: ${player.team.name}` : "No team assigned"}
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
