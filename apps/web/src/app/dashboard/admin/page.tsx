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

const toNonNegativeNumber = (value: string) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(0, Math.floor(parsed));
};

const topMatches = [
  { title: "Mumbai vs Chennai", format: "T20", status: "Trending" },
  { title: "Delhi vs Bengaluru", format: "League", status: "High Demand" },
  { title: "Final Preview", format: "Final", status: "Sold Out" },
];

export default function AdminDashboardPage() {
  const [teams, setTeams] = useState<Array<{ id: string; name: string; logoUrl?: string }>>([]);
  const [players, setPlayers] = useState<Array<{ id: string; name: string; role?: string; profileImageUrl?: string; team?: { id?: string; name?: string } | null; user?: { email?: string }; basePrice?: number; matchesPlayed?: number; totalRuns?: number; totalWickets?: number }>>([]);
  const [tickets, setTickets] = useState<Array<{ id: string; status?: string; fieldName?: string; currentValue?: string; requestedValue?: string; reason?: string; player?: { name?: string }; requestedBy?: { name?: string; email?: string } }>>([]);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [teamForm, setTeamForm] = useState({ name: "", logoUrl: "" });
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
    profileImageUrl: "",
  });
  const [profileForm, setProfileForm] = useState({ email: "", password: "" });
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [teamStatus, setTeamStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [playerStatus, setPlayerStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [profileStatus, setProfileStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmittingTeam, setIsSubmittingTeam] = useState(false);
  const [isSubmittingPlayer, setIsSubmittingPlayer] = useState(false);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [teamsResponse, playersResponse, ticketsResponse] = await Promise.all([
        fetch("/api/admin/teams", { cache: "no-store" }),
        fetch("/api/admin/players", { cache: "no-store" }),
        fetch("/api/stat-upgrades", { cache: "no-store" }),
      ]);

      const teamsResult = (await teamsResponse.json().catch(() => ({ data: [] }))) as { data?: Array<{ id: string; name: string; logoUrl?: string }> };
      const playersResult = (await playersResponse.json().catch(() => ({ data: [] }))) as { data?: Array<{ id: string; name: string; role?: string; profileImageUrl?: string; team?: { id?: string; name?: string } | null; user?: { email?: string }; basePrice?: number; matchesPlayed?: number; totalRuns?: number; totalWickets?: number }> };
      const ticketsResult = (await ticketsResponse.json().catch(() => ({ data: [] }))) as { data?: Array<{ id: string; status?: string; fieldName?: string; currentValue?: string; requestedValue?: string; reason?: string; player?: { name?: string }; requestedBy?: { name?: string; email?: string } }> };

      setTeams(Array.isArray(teamsResult.data) ? teamsResult.data : []);
      setPlayers(Array.isArray(playersResult.data) ? playersResult.data : []);
      setTickets(Array.isArray(ticketsResult.data) ? ticketsResult.data : []);
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
        editingTeamId
          ? { id: editingTeamId, name: teamForm.name.trim(), logoUrl: teamForm.logoUrl.trim() || "/logo/ltm.jpg" }
          : { name: teamForm.name.trim(), logoUrl: teamForm.logoUrl.trim() || "/logo/ltm.jpg" },
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
    setTeamForm({ name: "", logoUrl: "" });
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
        profileImageUrl: playerForm.profileImageUrl.trim() || "/images/default-player.svg",
        basePrice: toNonNegativeNumber(playerForm.basePrice),
        matchesPlayed: toNonNegativeNumber(playerForm.matchesPlayed),
        totalRuns: toNonNegativeNumber(playerForm.totalRuns),
        totalWickets: toNonNegativeNumber(playerForm.totalWickets),
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
      profileImageUrl: "",
    });
    setEditingPlayerId(null);
    setIsSubmittingPlayer(false);
    await loadDashboardData();
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmittingProfile(true);
    setProfileStatus(null);

    const response = await fetch("/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: profileForm.email.trim(),
        password: profileForm.password.trim(),
      }),
    });

    const result = (await response.json()) as { message?: string; success?: boolean };

    if (!response.ok || !result.success) {
      setProfileStatus({
        type: "error",
        message: result.message ?? "Unable to update profile.",
      });
      setIsSubmittingProfile(false);
      return;
    }

    setProfileStatus({
      type: "success",
      message: result.message ?? "Profile updated successfully.",
    });
    setProfileForm({ email: "", password: "" });
    setIsSubmittingProfile(false);
  };

  const handleTicketAction = async (ticketId: string, status: "APPROVED" | "REJECTED") => {
    const response = await fetch("/api/stat-upgrades", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: ticketId, status }),
    });

    const result = (await response.json()) as { message?: string; success?: boolean };

    if (!response.ok || !result.success) {
      setDashboardError(result.message ?? "Unable to update ticket.");
      return;
    }

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
                    onChange={(event) => setTeamForm({ ...teamForm, name: event.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-emerald-500"
                    placeholder="e.g. Kolkata Knight Riders"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="team-logo" className="mb-2 block text-sm font-medium text-slate-300">
                    Team Logo URL
                  </label>
                  <input
                    id="team-logo"
                    value={teamForm.logoUrl}
                    onChange={(event) => setTeamForm({ ...teamForm, logoUrl: event.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-emerald-500"
                    placeholder="/logo/ltm.jpg"
                  />
                  <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-2">
                    <img
                      src={teamForm.logoUrl || "/logo/ltm.jpg"}
                      alt="Team logo preview"
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <span className="text-xs text-slate-400">Uses LTM logo by default</span>
                  </div>
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
                        setTeamForm({ name: "", logoUrl: "" });
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

                <div className="md:col-span-2">
                  <label htmlFor="player-profile-image" className="mb-2 block text-sm font-medium text-slate-300">
                    Profile Image URL
                  </label>
                  <input
                    id="player-profile-image"
                    value={playerForm.profileImageUrl}
                    onChange={(event) => setPlayerForm({ ...playerForm, profileImageUrl: event.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-emerald-500"
                    placeholder="/images/default-player.svg"
                  />
                  <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-2">
                    <img
                      src={playerForm.profileImageUrl || "/images/default-player.svg"}
                      alt="Player profile preview"
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <span className="text-xs text-slate-400">Defaults to the player avatar</span>
                  </div>
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
                          profileImageUrl: "",
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

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Tickets & Updates</h2>
            <span className="text-xs uppercase tracking-[0.2em] text-amber-400">Review</span>
          </div>

          <div className="space-y-3">
            {tickets.length === 0 ? (
              <p className="text-sm text-slate-400">No stat upgrade tickets yet.</p>
            ) : (
              tickets.map((ticket) => (
                <div key={ticket.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">{ticket.player?.name ?? "Player"}</p>
                      <p className="text-xs text-slate-400">{ticket.fieldName ?? "Stat"}: {ticket.currentValue ?? "0"} → {ticket.requestedValue ?? "0"}</p>
                    </div>
                    <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-amber-300">
                      {ticket.status ?? "PENDING"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-300">{ticket.reason ?? "No reason provided."}</p>
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-400">
                    <span>{ticket.requestedBy?.name ?? ticket.requestedBy?.email ?? "Player"}</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleTicketAction(ticket.id, "APPROVED")}
                        className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1.5 text-[10px] uppercase tracking-[0.2em] text-emerald-200"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTicketAction(ticket.id, "REJECTED")}
                        className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-1.5 text-[10px] uppercase tracking-[0.2em] text-rose-200"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Account Details</h2>
            <span className="text-xs uppercase tracking-[0.2em] text-violet-400">Update</span>
          </div>

          <div className="space-y-5">
            <div>
              <label htmlFor="profile-email" className="mb-2 block text-sm font-medium text-slate-300">
                Email Address
              </label>
              <input
                id="profile-email"
                type="email"
                value={profileForm.email}
                onChange={(event) => setProfileForm({ ...profileForm, email: event.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-violet-500"
                placeholder="admin@ltm.com"
              />
            </div>

            <div>
              <label htmlFor="profile-password" className="mb-2 block text-sm font-medium text-slate-300">
                New Password
              </label>
              <input
                id="profile-password"
                type="password"
                value={profileForm.password}
                onChange={(event) => setProfileForm({ ...profileForm, password: event.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-violet-500"
                placeholder="New password"
              />
            </div>

            {profileStatus ? (
              <div className={`rounded-xl border px-3 py-2 text-sm ${profileStatus.type === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-rose-500/30 bg-rose-500/10 text-rose-200"}`}>
                {profileStatus.message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmittingProfile}
              className="w-full rounded-xl bg-violet-500 px-4 py-3 font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmittingProfile ? "Saving profile..." : "Save profile"}
            </button>
          </div>
        </form>
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
                <div key={team.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={team.logoUrl || "/logo/ltm.jpg"}
                      alt={`${team.name} logo`}
                      className="h-11 w-11 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-semibold text-white">{team.name}</p>
                      <p className="text-xs text-slate-400">{players.filter((player) => player.team?.id === team.id).length} players assigned</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`/dashboard/team/${team.id}`}
                      className="rounded-xl border border-cyan-700 bg-cyan-900/30 px-3 py-2 text-sm font-medium text-cyan-200 transition hover:border-cyan-500 hover:text-cyan-300"
                    >
                      View details
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setTeamForm({ name: team.name, logoUrl: team.logoUrl ?? "" });
                        setEditingTeamId(team.id);
                        setTeamStatus(null);
                      }}
                      className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-emerald-500 hover:text-emerald-300"
                    >
                      Edit
                    </button>
                  </div>
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
                  <div className="flex items-center gap-3">
                    <img
                      src={player.profileImageUrl || "/images/default-player.svg"}
                      alt={`${player.name} profile`}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-white">{player.name}</p>
                      <p className="text-xs text-slate-400">
                        {player.role ?? "BATSMAN"} · {player.team?.name ?? "Unassigned"}
                      </p>
                    </div>
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
                        profileImageUrl: player.profileImageUrl ?? "",
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
