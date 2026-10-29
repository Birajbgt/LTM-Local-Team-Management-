import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getCurrentUser, roleLabels } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function TeamDashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const token = (await cookies()).get("token")?.value;
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  let teams: Array<{ id: string; name: string; players?: Array<{ id: string; name: string }> }> = [];

  if (token) {
    const response = await fetch(`${apiBaseUrl}/api/teams`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (response.ok) {
      const payload = (await response.json()) as Array<{
        id?: string;
        name?: string;
        players?: Array<{ id: string; name: string }>;
      }>;

      teams = (payload ?? [])
        .filter((team): team is { id: string; name: string; players?: Array<{ id: string; name: string }> } => Boolean(team.id && team.name))
        .map((team) => ({
          id: team.id,
          name: team.name,
          players: team.players ?? [],
        }));
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 rounded-3xl border border-cyan-500/30 bg-cyan-500/10 p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
          {roleLabels[currentUser.role]}
        </p>
        <h1 className="mt-3 text-3xl font-bold text-white">Welcome back, {currentUser.name}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { title: "Create match", text: "Set new fixtures and decide club responsibilities." },
          { title: "Add players", text: "Add athletes to the roster and assign primary positions." },
          { title: "Player stats", text: "Track match stats, fitness metrics, and training output." },
        ].map((item) => (
          <article key={item.title} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-xl font-semibold text-white">{item.title}</h2>
            <p className="mt-3 text-slate-300">{item.text}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Teams</h2>
          <span className="text-xs uppercase tracking-[0.2em] text-cyan-400">Live roster</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {teams.length === 0 ? (
            <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4 text-slate-300 md:col-span-2 xl:col-span-3">
              No teams found yet.
            </div>
          ) : (
            teams.map((team) => (
              <article key={team.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-white">{team.name}</h3>
                  <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-cyan-300">
                    {team.players?.length ?? 0} players
                  </span>
                </div>
                <div className="mt-4 space-y-2 text-sm text-slate-300">
                  {(team.players ?? []).slice(0, 4).map((player) => (
                    <div key={player.id}>{player.name}</div>
                  ))}
                </div>
                <div className="mt-5">
                  <a
                    href={`/dashboard/team/${team.id}`}
                    className="inline-flex rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-200 transition hover:border-cyan-400"
                  >
                    View details
                  </a>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
