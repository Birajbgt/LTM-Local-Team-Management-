"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type PlayerRecord = {
  id: string;
  name: string;
  role?: string;
  profileImageUrl?: string;
  team?: { id?: string; name?: string } | null;
  user?: { email?: string };
  basePrice?: number;
  matchesPlayed?: number;
  totalRuns?: number;
  totalWickets?: number;
};

const emptyForm = {
  name: "",
  email: "",
  role: "BATSMAN",
  basePrice: "0",
  matchesPlayed: "0",
  totalRuns: "0",
  totalWickets: "0",
  teamId: "",
  profileImageUrl: "/images/default-player.svg",
};

const sanitizeNonNegative = (value: string) => {
  if (value === "") {
    return "0";
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return "0";
  }

  return String(Math.max(0, Math.floor(parsed)));
};

export default function PlayerDetailPage() {
  const params = useParams<{ id?: string }>();
  const playerId = Array.isArray(params?.id) ? params.id[0] : params?.id ?? "";
  const [player, setPlayer] = useState<PlayerRecord | null>(null);
  const [teams, setTeams] = useState<Array<{ id: string; name: string }>>([]);
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!playerId) {
      setIsLoading(false);
      return;
    }

    const loadPlayer = async () => {
      try {
        const [playersResponse, teamsResponse] = await Promise.all([
          fetch("/api/admin/players", { cache: "no-store" }),
          fetch("/api/admin/teams", { cache: "no-store" }),
        ]);

        const playersResult = (await playersResponse.json().catch(() => ({ data: [] }))) as {
          data?: PlayerRecord[];
          success?: boolean;
          message?: string;
        };
        const teamsResult = (await teamsResponse.json().catch(() => ({ data: [] }))) as {
          data?: Array<{ id: string; name: string }>;
        };

        if (!playersResponse.ok || !playersResult.success) {
          throw new Error(playersResult.message ?? "Unable to load player details.");
        }

        const selected = (Array.isArray(playersResult.data) ? playersResult.data : []).find(
          (item) => item.id === playerId,
        );

        if (!selected) {
          throw new Error("Player not found.");
        }

        setTeams(Array.isArray(teamsResult.data) ? teamsResult.data : []);
        setPlayer(selected);
        setForm({
          name: selected.name ?? "",
          email: selected.user?.email ?? "",
          role: selected.role ?? "BATSMAN",
          basePrice: String(selected.basePrice ?? 0),
          matchesPlayed: String(selected.matchesPlayed ?? 0),
          totalRuns: String(selected.totalRuns ?? 0),
          totalWickets: String(selected.totalWickets ?? 0),
          teamId: selected.team?.id ?? "",
          profileImageUrl: selected.profileImageUrl ?? "/images/default-player.svg",
        });
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load player details.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadPlayer();
  }, [playerId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    const safePayload = {
      id: playerId,
      name: form.name,
      email: form.email,
      role: form.role,
      profileImageUrl: form.profileImageUrl?.trim() || "/images/default-player.svg",
      basePrice: Math.max(0, Number(form.basePrice) || 0),
      matchesPlayed: Math.max(0, Number(form.matchesPlayed) || 0),
      totalRuns: Math.max(0, Number(form.totalRuns) || 0),
      totalWickets: Math.max(0, Number(form.totalWickets) || 0),
      teamId: form.teamId || undefined,
    };

    const response = await fetch("/api/admin/players", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(safePayload),
    });

    const result = (await response.json().catch(() => ({ success: false, message: "Unable to save player details." }))) as {
      success?: boolean;
      message?: string;
    };

    if (!response.ok || !result.success) {
      setError(result.message ?? "Unable to save player details.");
      setIsSaving(false);
      return;
    }

    setSuccess("Player details updated successfully.");
    setIsSaving(false);
    const refreshedPlayers = await fetch("/api/admin/players", { cache: "no-store" });
    const refreshed = (await refreshedPlayers.json().catch(() => ({ data: [] }))) as {
      data?: PlayerRecord[];
    };
    const updated = (Array.isArray(refreshed.data) ? refreshed.data : []).find((item) => item.id === playerId) ?? null;
    setPlayer(updated);
  };

  if (!playerId) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200">
          Player id is missing.
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-slate-300">
          Loading player details...
        </div>
      </section>
    );
  }

  if (!player) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200">
          {error ?? "Player not found."}
        </div>
        <div className="mt-4">
          <Link href="/dashboard/player" className="text-violet-300 underline hover:text-violet-200">
            Back to players
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Player profile</p>
          <h1 className="mt-3 text-3xl font-bold text-white">{player.name}</h1>
        </div>
        <Link
          href="/dashboard/player"
          className="rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-200 transition hover:border-violet-400"
        >
          Back to list
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center gap-4">
            <img
              src={player.profileImageUrl || "/images/default-player.svg"}
              alt={`${player.name} profile`}
              className="h-20 w-20 rounded-full object-cover border border-slate-700"
            />
            <h2 className="text-2xl font-semibold text-white">Overview</h2>
          </div>

          <div className="mt-6 space-y-4 text-sm text-slate-300">
            <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
              <span>Role</span>
              <strong className="text-white">{player.role ?? "BATSMAN"}</strong>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
              <span>Team</span>
              <strong className="text-white">{player.team?.name ?? "Unassigned"}</strong>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
              <span>Email</span>
              <strong className="text-white">{player.user?.email ?? "-"}</strong>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
              <span>Base price</span>
              <strong className="text-white">{player.basePrice ?? 0}</strong>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
              <span>Matches</span>
              <strong className="text-white">{player.matchesPlayed ?? 0}</strong>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
              <span>Runs</span>
              <strong className="text-white">{player.totalRuns ?? 0}</strong>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
              <span>Wickets</span>
              <strong className="text-white">{player.totalWickets ?? 0}</strong>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-2xl font-semibold text-white">Edit player details</h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-300">Full name</label>
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-violet-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-300">Profile image URL</label>
              <input
                value={form.profileImageUrl}
                onChange={(event) => setForm({ ...form, profileImageUrl: event.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-violet-500"
                placeholder="/images/default-player.svg"
              />
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-2">
                <img
                  src={form.profileImageUrl || "/images/default-player.svg"}
                  alt="Player image preview"
                  className="h-12 w-12 rounded-full object-cover"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-violet-500"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Role</label>
              <select
                value={form.role}
                onChange={(event) => setForm({ ...form, role: event.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-violet-500"
              >
                <option value="BATSMAN">Batsman</option>
                <option value="BOWLER">Bowler</option>
                <option value="ALL_ROUNDER">All-rounder</option>
                <option value="WICKET_KEEPER">Wicketkeeper</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Team</label>
              <select
                value={form.teamId}
                onChange={(event) => setForm({ ...form, teamId: event.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-violet-500"
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
              <label className="mb-2 block text-sm font-medium text-slate-300">Base price</label>
              <input
                type="number"
                min="0"
                value={form.basePrice}
                onChange={(event) => setForm({ ...form, basePrice: sanitizeNonNegative(event.target.value) })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-violet-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Matches played</label>
              <input
                type="number"
                min="0"
                value={form.matchesPlayed}
                onChange={(event) => setForm({ ...form, matchesPlayed: sanitizeNonNegative(event.target.value) })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-violet-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Total runs</label>
              <input
                type="number"
                min="0"
                value={form.totalRuns}
                onChange={(event) => setForm({ ...form, totalRuns: sanitizeNonNegative(event.target.value) })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-violet-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Total wickets</label>
              <input
                type="number"
                min="0"
                value={form.totalWickets}
                onChange={(event) => setForm({ ...form, totalWickets: sanitizeNonNegative(event.target.value) })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-violet-500"
              />
            </div>
          </div>

          {error ? (
            <div className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
              {success}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSaving}
            className="mt-6 w-full rounded-xl bg-violet-500 px-4 py-3 font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving changes..." : "Save changes"}
          </button>
        </form>
      </div>
    </section>
  );
}
