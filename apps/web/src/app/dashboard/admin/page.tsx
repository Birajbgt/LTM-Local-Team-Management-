"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

const playerRoles = [
  { label: "Batsman", value: "BATSMAN" },
  { label: "Bowler", value: "BOWLER" },
  { label: "All-rounder", value: "ALL_ROUNDER" },
  { label: "Wicketkeeper", value: "WICKET_KEEPER" },
];

const upcomingMatches = [
  { home: "Mumbai Mavericks", away: "Chennai Chargers", date: "Nov 04", venue: "Wankhede Stadium" },
  { home: "Delhi Strikers", away: "Bengaluru Bulls", date: "Nov 06", venue: "Arun Jaitley Stadium" },
  { home: "Lucknow Lions", away: "Hyderabad Hawks", date: "Nov 08", venue: "Ekana Stadium" },
];

const topMatches = [
  { title: "Mumbai vs Chennai", format: "T20", status: "Trending" },
  { title: "Delhi vs Bengaluru", format: "League", status: "High Demand" },
  { title: "Final Preview", format: "Final", status: "Sold Out" },
];

export default function AdminDashboardPage() {
  const [teams, setTeams] = useState<Array<{ id: string; name: string }>>([]);
  const [players, setPlayers] = useState<Array<{ id: string; name: string; role?: string; team?: { id?: string; name?: string } | null; user?: { email?: string }; basePrice?: number; matchesPlayed?: number; totalRuns?: number; totalWickets?: number }>>([]);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [teamForm, setTeamForm] = useState({ name: "" });
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [playerForm, setPlayerForm] = useState({
    name: "",
    email: "",
    role: "BATSMAN",
    basePrice: "",
    matchesPlayed: "",
    totalRuns: "",
    totalWickets: "",
    teamId: "",
  });
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [teamStatus, setTeamStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [playerStatus, setPlayerStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmittingTeam, setIsSubmittingTeam] = useState(false);
  const [isSubmittingPlayer, setIsSubmittingPlayer] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [teamsResponse, playersResponse] = await Promise.all([
        fetch("/api/admin/teams", { cache: "no-store" }),
        fetch("/api/admin/players", { cache: "no-store" }),
      ]);

      const teamsResult = (await teamsResponse.json().catch(() => ({ data: [] }))) as { data?: Array<{ id: string; name: string }> };
      const playersResult = (await playersResponse.json().catch(() => ({ data: [] }))) as { data?: Array<{ id: string; name: string; role?: string; team?: { id?: string; name?: string } | null; user?: { email?: string }; basePrice?: number; matchesPlayed?: number; totalRuns?: number; totalWickets?: number }> };

      setTeams(Array.isArray(teamsResult.data) ? teamsResult.data : []);
      setPlayers(Array.isArray(playersResult.data) ? playersResult.data : []);
    } catch {
      setDashboardError("Unable to load dashboard data.");
    } finally {
      setIsDashboardLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboardData();
  }, []);

  const summaryCards = useMemo(
    () => [
      { label: "Active Teams", value: String(teams.length), note: teams.length > 0 ? "Live clubs" : "No teams yet" },
      { label: "Registered Players", value: String(players.length), note: players.length > 0 ? "Active roster" : "Awaiting signups" },
      { label: "Top Run Scorer", value: players.length ? `${Math.max(...players.map((player) => Number(player.totalRuns ?? 0)))} runs` : "0 runs", note: "Updated live" },
      { label: "Open Requests", value: "09", note: "4 pending review" },
    ],
    [players, teams],
  );

  const bestPlayers = useMemo(
    () =>
      [...players]
        .sort((a, b) => Number(b.totalRuns ?? 0) - Number(a.totalRuns ?? 0))
        .slice(0, 4)
        .map((player) => ({
          name: player.name,
          team: player.team?.name ?? "Unassigned",
          runs: String(player.totalRuns ?? 0),
          wickets: String(player.totalWickets ?? 0),
          role: player.role ?? "BATSMAN",
        })),
    [players],
  );

  const handleTeamSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmittingTeam(true);
    setTeamStatus(null);

    const method = editingTeamId ? "PATCH" : "POST";
    const response = await fetch("/api/admin/teams", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        editingTeamId ? { id: editingTeamId, name: teamForm.name.trim() } : { name: teamForm.name.trim() },
      ),
    });

    const result = (await response.json()) as { message?: string; success?: boolean; id?: string };

    if (!response.ok || !result.success) {
      setTeamStatus({
        type: "error",
        message: result.message ?? (editingTeamId ? "Unable to update team." : "Unable to create team."),
      });
      setIsSubmittingTeam(false);
      return;
    }

    setTeamStatus({
      type: "success",
      message: `${editingTeamId ? "Team updated" : "Team created"} successfully${result.id ? ` (ID: ${result.id})` : ""}.`,
    });
    setTeamForm({ name: "" });
    setEditingTeamId(null);
    setIsSubmittingTeam(false);
    await loadDashboardData();
  };

  const handlePlayerSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmittingPlayer(true);
    setPlayerStatus(null);

    const method = editingPlayerId ? "PATCH" : "POST";
    const response = await fetch("/api/admin/players", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(editingPlayerId ? { id: editingPlayerId } : {}),
        ...playerForm,
        basePrice: Number(playerForm.basePrice),
        matchesPlayed: Number(playerForm.matchesPlayed),
        totalRuns: Number(playerForm.totalRuns),
        totalWickets: Number(playerForm.totalWickets),
        teamId: playerForm.teamId || undefined,
      }),
    });

    const result = (await response.json()) as { message?: string; success?: boolean; id?: string };

    if (!response.ok || !result.success) {
      setPlayerStatus({
        type: "error",
        message: result.message ?? (editingPlayerId ? "Unable to update player." : "Unable to create player."),
      });
      setIsSubmittingPlayer(false);
      return;
    }

    setPlayerStatus({
      type: "success",
      message: `${editingPlayerId ? "Player updated" : "Player created"} successfully${result.id ? ` (ID: ${result.id})` : ""}.`,
    });
    setPlayerForm({
      name: "",
      email: "",
      role: "BATSMAN",
      basePrice: "",
      matchesPlayed: "",
      totalRuns: "",
      totalWickets: "",
      teamId: "",
    });
    setEditingPlayerId(null);
    setIsSubmittingPlayer(false);
    await loadDashboardData();
  };

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Admin Dashboard</p>
        <h1 className="mt-3 text-3xl font-bold text-white">Cricket operations overview</h1>
        <p className="mt-2 text-slate-300">Manage teams, players, match scheduling, and top performers in one place.</p>
      </div>

      {dashboardError ? (
        <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {dashboardError}
        </div>
      ) : null}

      {isDashboardLoading ? (
        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-sm text-slate-300">
          Loading dashboard data...
        </div>
      ) : null}

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">{card.label}</p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <span className="text-3xl font-bold text-white">{card.value}</span>
              <span className="text-xs uppercase tracking-[0.2em] text-emerald-400">{card.note}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <form onSubmit={handleTeamSubmit} className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">{editingTeamId ? "Update Team" : "Add Team"}</h2>
                <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs uppercase tracking-[0.2em] text-emerald-300">
                  {editingTeamId ? "Edit" : "Create"}
                </span>
              </div>

              <div className="space-y-5">
                <div>
                  <label htmlFor="team-name" className="mb-2 block text-sm font-medium text-slate-300">
                    Team Name
                  </label>
                  <input
                    id="team-name"
                    value={teamForm.name}
                    onChange={(event) => setTeamForm({ name: event.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-emerald-500"
                    placeholder="e.g. Kolkata Knight Riders"
                    required
                  />
                </div>

                {teamStatus ? (
                  <div
                    className={`rounded-xl border px-3 py-2 text-sm ${
                      teamStatus.type === "success"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                        : "border-rose-500/30 bg-rose-500/10 text-rose-200"
                    }`}
                  >
                    {teamStatus.message}
                  </div>
                ) : null}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmittingTeam}
                    className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmittingTeam ? (editingTeamId ? "Updating team..." : "Creating team...") : (editingTeamId ? "Update team" : "Add team")}
                  </button>
                  {editingTeamId ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTeamId(null);
                        setTeamForm({ name: "" });
                        setTeamStatus(null);
                      }}
                      className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 font-medium text-slate-200"
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
              </div>
            </form>

            <form onSubmit={handlePlayerSubmit} className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">{editingPlayerId ? "Update Player" : "Add Player"}</h2>
                <span className="rounded-full bg-cyan-500/15 px-2 py-1 text-xs uppercase tracking-[0.2em] text-cyan-300">
                  {editingPlayerId ? "Edit" : "Register"}
                </span>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label htmlFor="player-name" className="mb-2 block text-sm font-medium text-slate-300">
                    Player Name
                  </label>
                  <input
                    id="player-name"
                    value={playerForm.name}
                    onChange={(event) => setPlayerForm({ ...playerForm, name: event.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-emerald-500"
                    placeholder="e.g. Rohit Sharma"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="player-email" className="mb-2 block text-sm font-medium text-slate-300">
                    Player Email
                  </label>
                  <input
                    id="player-email"
                    type="email"
                    value={playerForm.email}
                    onChange={(event) => setPlayerForm({ ...playerForm, email: event.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-emerald-500"
                    placeholder="player@ltm.local"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="player-role" className="mb-2 block text-sm font-medium text-slate-300">
                    Role
                  </label>
                  <select
                    id="player-role"
                    value={playerForm.role}
                    onChange={(event) => setPlayerForm({ ...playerForm, role: event.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-emerald-500"
                  >
                    {playerRoles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="player-team" className="mb-2 block text-sm font-medium text-slate-300">
                    Assign Team
                  </label>
                  <select
                    id="player-team"
                    value={playerForm.teamId}
                    onChange={(event) => setPlayerForm({ ...playerForm, teamId: event.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-emerald-500"
                  >
                    <option value="">No team assigned</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="player-base-price" className="mb-2 block text-sm font-medium text-slate-300">
                    Base Price
                  </label>
                  <input
                    id="player-base-price"
                    type="number"
                    min="0"
                    value={playerForm.basePrice}
                    onChange={(event) => setPlayerForm({ ...playerForm, basePrice: event.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-emerald-500"
                    placeholder="250000"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="player-matches" className="mb-2 block text-sm font-medium text-slate-300">
                    Matches Played
                  </label>
                  <input
                    id="player-matches"
                    type="number"
                    min="0"
                    value={playerForm.matchesPlayed}
                    onChange={(event) => setPlayerForm({ ...playerForm, matchesPlayed: event.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-emerald-500"
                    placeholder="18"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="player-runs" className="mb-2 block text-sm font-medium text-slate-300">
                    Total Runs
                  </label>
                  <input
                    id="player-runs"
                    type="number"
                    min="0"
                    value={playerForm.totalRuns}
                    onChange={(event) => setPlayerForm({ ...playerForm, totalRuns: event.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-emerald-500"
                    placeholder="412"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="player-wickets" className="mb-2 block text-sm font-medium text-slate-300">
                    Total Wickets
                  </label>
                  <input
                    id="player-wickets"
                    type="number"
                    min="0"
                    value={playerForm.totalWickets}
                    onChange={(event) => setPlayerForm({ ...playerForm, totalWickets: event.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-emerald-500"
                    placeholder="14"
                    required
                  />
                </div>

                {playerStatus ? (
                  <div className={`md:col-span-2 rounded-xl border px-3 py-2 text-sm ${playerStatus.type === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-rose-500/30 bg-rose-500/10 text-rose-200"}`}>
                    {playerStatus.message}
                  </div>
                ) : null}

                <div className="md:col-span-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmittingPlayer}
                    className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmittingPlayer ? (editingPlayerId ? "Updating player..." : "Creating player...") : (editingPlayerId ? "Update player" : "Add player")}
                  </button>
                  {editingPlayerId ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPlayerId(null);
                        setPlayerForm({
                          name: "",
                          email: "",
                          role: "BATSMAN",
                          basePrice: "",
                          matchesPlayed: "",
                          totalRuns: "",
                          totalWickets: "",
                          teamId: "",
                        });
                        setPlayerStatus(null);
                      }}
                      className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 font-medium text-slate-200"
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-8">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Best Players</h2>
              <span className="text-xs uppercase tracking-[0.2em] text-emerald-400">Top form</span>
            </div>

            <div className="space-y-4">
              {bestPlayers.map((player, index) => (
                <div key={player.name} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 text-sm font-bold text-emerald-300">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{player.name}</p>
                      <p className="text-xs text-slate-400">{player.role} · {player.team}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-slate-300">
                    <div>{player.runs} runs</div>
                    <div>{player.wickets} wickets</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Upcoming Matches</h2>
              <span className="text-xs uppercase tracking-[0.2em] text-cyan-400">Schedule</span>
            </div>

            <div className="space-y-4">
              {upcomingMatches.map((match) => (
                <div key={`${match.home}-${match.away}`} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
                    <span>{match.date}</span>
                    <span>{match.venue}</span>
                  </div>
                  <div className="mt-3 text-white">
                    <div className="font-semibold">{match.home} vs {match.away}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Top Matches</h2>
              <span className="text-xs uppercase tracking-[0.2em] text-violet-400">Featured</span>
            </div>

            <div className="space-y-4">
              {topMatches.map((match) => (
                <div key={match.title} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <div>
                    <p className="font-semibold text-white">{match.title}</p>
                    <p className="text-xs text-slate-400">{match.format}</p>
                  </div>
                  <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-violet-300">
                    {match.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Team Directory</h2>
            <span className="text-xs uppercase tracking-[0.2em] text-emerald-400">Edit</span>
          </div>

          <div className="space-y-3">
            {teams.length === 0 ? (
              <p className="text-sm text-slate-400">No teams yet.</p>
            ) : (
              teams.map((team) => (
                <div key={team.id} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <div>
                    <p className="font-semibold text-white">{team.name}</p>
                    <p className="text-xs text-slate-400">{players.filter((player) => player.team?.id === team.id).length} players assigned</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTeamForm({ name: team.name });
                      setEditingTeamId(team.id);
                      setTeamStatus(null);
                    }}
                    className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-emerald-500 hover:text-emerald-300"
                  >
                    Edit
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Player Directory</h2>
            <span className="text-xs uppercase tracking-[0.2em] text-cyan-400">Edit</span>
          </div>

          <div className="space-y-3">
            {players.length === 0 ? (
              <p className="text-sm text-slate-400">No players yet.</p>
            ) : (
              players.map((player) => (
                <div key={player.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <div>
                    <p className="font-semibold text-white">{player.name}</p>
                    <p className="text-xs text-slate-400">
                      {player.role ?? "BATSMAN"} · {player.team?.name ?? "Unassigned"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPlayerForm({
                        name: player.name,
                        email: player.user?.email ?? "",
                        role: player.role ?? "BATSMAN",
                        basePrice: String(player.basePrice ?? 0),
                        matchesPlayed: String(player.matchesPlayed ?? 0),
                        totalRuns: String(player.totalRuns ?? 0),
                        totalWickets: String(player.totalWickets ?? 0),
                        teamId: player.team?.id ?? "",
                      });
                      setEditingPlayerId(player.id);
                      setPlayerStatus(null);
                    }}
                    className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-500 hover:text-cyan-300"
                  >
                    Edit
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
