"use client";

import { FormEvent, useEffect, useState } from "react";

type TeamUser = {
  email?: string;
  name?: string;
};

type TeamData = {
  id: string;
  name: string;
  logoUrl?: string;
  users?: TeamUser[];
  players?: Array<{ id: string; name: string; role?: string; teamId?: string; team?: { id?: string; name?: string } | null }>;
};

type UserData = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type PlayerData = {
  id: string;
  name: string;
  role?: string;
  teamId?: string;
  team?: { id?: string; name?: string } | null;
  basePrice?: number;
  matchesPlayed?: number;
  totalRuns?: number;
  totalWickets?: number;
};

type TicketData = {
  id: string;
  status?: string;
  fieldName?: string;
  currentValue?: string;
  requestedValue?: string;
  reason?: string;
  player?: { id?: string; name?: string };
};

const playerRoles = [
  { label: "Batsman", value: "BATSMAN" },
  { label: "Bowler", value: "BOWLER" },
  { label: "All-rounder", value: "ALL_ROUNDER" },
  { label: "Wicketkeeper", value: "WICKET_KEEPER" },
];

export default function TeamDashboardPage() {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [team, setTeam] = useState<TeamData | null>(null);
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "BATSMAN",
    basePrice: "",
    matchesPlayed: "",
    totalRuns: "",
    totalWickets: "",
    profileImageUrl: "",
  });
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [userResponse, teamsResponse, playersResponse, ticketsResponse] = await Promise.all([
          fetch("/api/auth/profile", { cache: "no-store" }),
          fetch("/api/admin/teams", { cache: "no-store" }),
          fetch("/api/admin/players", { cache: "no-store" }),
          fetch("/api/stat-upgrades", { cache: "no-store" }),
        ]);

        const userResult = (await userResponse.json().catch(() => ({ success: false, data: null }))) as {
          success?: boolean;
          data?: UserData;
        };
        const teamsResult = (await teamsResponse.json().catch(() => ({ data: [] }))) as { data?: TeamData[] };
        const playersResult = (await playersResponse.json().catch(() => ({ data: [] }))) as { data?: PlayerData[] };
        const ticketsResult = (await ticketsResponse.json().catch(() => ({ data: [] }))) as { data?: TicketData[] };

        if (userResult.success && userResult.data) {
          setCurrentUser(userResult.data);
        }

        const allTeams = Array.isArray(teamsResult.data) ? teamsResult.data : [];
        const matchedTeam = allTeams.find((item) =>
          item.users?.some((member) => member.email?.toLowerCase() === userResult.data?.email?.toLowerCase()),
        ) ?? null;

        setTeam(matchedTeam);

        const allPlayers = Array.isArray(playersResult.data) ? playersResult.data : [];
        const clubPlayers = matchedTeam
          ? allPlayers.filter((player) => player.teamId === matchedTeam.id || player.team?.id === matchedTeam.id)
          : [];

        setPlayers(clubPlayers);

        const allTickets = Array.isArray(ticketsResult.data) ? ticketsResult.data : [];
        const clubTickets = matchedTeam
          ? allTickets.filter((ticket) =>
              Boolean(ticket.player?.id) && clubPlayers.some((player) => player.id === ticket.player?.id),
            )
          : [];

        setTickets(clubTickets);
      } catch {
        setStatus({
          type: "error",
          message: "Unable to load club data.",
        });
      }
    };

    void loadData();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!team) {
      setStatus({ type: "error", message: "No club is linked to this account." });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    const response = await fetch("/api/admin/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        teamId: team.id,
        basePrice: Number(form.basePrice) || 0,
        matchesPlayed: Number(form.matchesPlayed) || 0,
        totalRuns: Number(form.totalRuns) || 0,
        totalWickets: Number(form.totalWickets) || 0,
        profileImageUrl: form.profileImageUrl.trim() || "/images/default-player.svg",
      }),
    });

    const result = (await response.json().catch(() => ({ success: false, message: "Unable to create player." }))) as {
      success?: boolean;
      message?: string;
    };

    if (!response.ok || !result.success) {
      setStatus({
        type: "error",
        message: result.message ?? "Unable to create player.",
      });
      setIsSubmitting(false);
      return;
    }

    setStatus({
      type: "success",
      message: "Player added to your club successfully.",
    });
    setForm({
      name: "",
      email: "",
      role: "BATSMAN",
      basePrice: "",
      matchesPlayed: "",
      totalRuns: "",
      totalWickets: "",
      profileImageUrl: "",
    });
    setIsSubmitting(false);

    const refreshedPlayersResponse = await fetch("/api/admin/players", { cache: "no-store" });
    const refreshedPlayers = (await refreshedPlayersResponse.json().catch(() => ({ data: [] }))) as { data?: PlayerData[] };
    const refreshedClubPlayers = team
      ? (refreshedPlayers.data ?? []).filter((player) => player.teamId === team.id || player.team?.id === team.id)
      : [];
    setPlayers(refreshedClubPlayers);

    const refreshedTicketsResponse = await fetch("/api/stat-upgrades", { cache: "no-store" });
    const refreshedTickets = (await refreshedTicketsResponse.json().catch(() => ({ data: [] }))) as { data?: TicketData[] };
    const refreshedClubTickets = team
      ? (refreshedTickets.data ?? []).filter((ticket) =>
          Boolean(ticket.player?.id) && refreshedClubPlayers.some((player) => player.id === ticket.player?.id),
        )
      : [];
    setTickets(refreshedClubTickets);
  };

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 rounded-3xl border border-cyan-500/30 bg-cyan-500/10 p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Club Dashboard</p>
        <h1 className="mt-3 text-3xl font-bold text-white">Welcome back, {currentUser?.name ?? "Club"}</h1>
        <p className="mt-2 text-slate-300">
          {team ? `Managing ${team.name}` : "Loading club information..."}
        </p>
      </div>

      {status ? (
        <div className={`mb-8 rounded-xl border px-4 py-3 text-sm ${status.type === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-rose-500/30 bg-rose-500/10 text-rose-200"}`}>
          {status.message}
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-xl font-semibold text-white">My players</h2>
          <p className="mt-3 text-slate-300">{players.length} active players in your club.</p>
        </article>
        <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-xl font-semibold text-white">Open tickets</h2>
          <p className="mt-3 text-slate-300">{tickets.filter((ticket) => (ticket.status ?? "PENDING") === "PENDING").length} requests awaiting review.</p>
        </article>
        <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-xl font-semibold text-white">Club status</h2>
          <p className="mt-3 text-slate-300">{team ? team.name : "No linked club found"}</p>
        </article>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Players in your club</h2>
            <span className="text-xs uppercase tracking-[0.2em] text-cyan-400">Roster</span>
          </div>

          <div className="space-y-3">
            {players.length === 0 ? (
              <p className="text-sm text-slate-400">No players assigned to this club yet.</p>
            ) : (
              players.map((player) => (
                <div key={player.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">{player.name}</p>
                      <p className="text-xs text-slate-400">{player.role ?? "BATSMAN"}</p>
                    </div>
                    <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-cyan-300">
                      {player.matchesPlayed ?? 0} matches
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
                    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2">
                      <div className="text-slate-400">Runs</div>
                      <div className="mt-1 font-semibold text-white">{player.totalRuns ?? 0}</div>
                    </div>
                    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2">
                      <div className="text-slate-400">Wickets</div>
                      <div className="mt-1 font-semibold text-white">{player.totalWickets ?? 0}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Add player</h2>
            <span className="text-xs uppercase tracking-[0.2em] text-cyan-400">Club</span>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Player name</label>
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-cyan-500"
                placeholder="e.g. Arjun Patel"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-cyan-500"
                placeholder="player@ltm.local"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Role</label>
              <select
                value={form.role}
                onChange={(event) => setForm({ ...form, role: event.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-cyan-500"
              >
                {playerRoles.map((role) => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Base price</label>
                <input
                  type="number"
                  min="0"
                  value={form.basePrice}
                  onChange={(event) => setForm({ ...form, basePrice: event.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Matches</label>
                <input
                  type="number"
                  min="0"
                  value={form.matchesPlayed}
                  onChange={(event) => setForm({ ...form, matchesPlayed: event.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Runs</label>
                <input
                  type="number"
                  min="0"
                  value={form.totalRuns}
                  onChange={(event) => setForm({ ...form, totalRuns: event.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Wickets</label>
                <input
                  type="number"
                  min="0"
                  value={form.totalWickets}
                  onChange={(event) => setForm({ ...form, totalWickets: event.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Profile image URL</label>
              <input
                value={form.profileImageUrl}
                onChange={(event) => setForm({ ...form, profileImageUrl: event.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-cyan-500"
                placeholder="/images/default-player.svg"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !team}
              className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Adding player..." : "Add player to club"}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Club tickets</h2>
          <span className="text-xs uppercase tracking-[0.2em] text-cyan-400">Review</span>
        </div>

        <div className="space-y-3">
          {tickets.length === 0 ? (
            <p className="text-sm text-slate-400">No ticket requests for this club yet.</p>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{ticket.player?.name ?? "Player"}</p>
                    <p className="text-xs text-slate-400">{ticket.fieldName ?? "Stat"}: {ticket.currentValue ?? "0"} → {ticket.requestedValue ?? "0"}</p>
                  </div>
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-amber-300">
                    {ticket.status ?? "PENDING"}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-300">{ticket.reason ?? "No reason provided."}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
