"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type TeamRecord = {
  id: string;
  name: string;
  logoUrl?: string;
  players?: Array<{ id: string; name: string; role?: string; user?: { email?: string } }>;
  users?: Array<{ id: string; email?: string; role?: string }>;
};

const emptyForm = {
  name: "",
  logoUrl: "/logo/ltm.jpg",
};

export default function TeamDetailPage() {
  const params = useParams<{ id?: string }>();
  const teamId = Array.isArray(params?.id) ? params.id[0] : params?.id ?? "";
  const [team, setTeam] = useState<TeamRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!teamId) {
      setIsLoading(false);
      return;
    }

    const loadTeam = async () => {
      try {
        const response = await fetch("/api/admin/teams", { cache: "no-store" });
        const result = (await response.json().catch(() => ({ data: [] }))) as {
          data?: TeamRecord[];
          success?: boolean;
          message?: string;
        };

        if (!response.ok || !result.success) {
          throw new Error(result.message ?? "Unable to load team details.");
        }

        const selected = (Array.isArray(result.data) ? result.data : []).find((item) => item.id === teamId);

        if (!selected) {
          throw new Error("Team not found.");
        }

        setTeam(selected);
        setForm({ name: selected.name ?? "", logoUrl: selected.logoUrl ?? "/logo/ltm.jpg" });
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load team details.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadTeam();
  }, [teamId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    const response = await fetch("/api/admin/teams", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: teamId,
        name: form.name.trim(),
        logoUrl: form.logoUrl?.trim() || "/logo/ltm.jpg",
      }),
    });

    const result = (await response.json().catch(() => ({ success: false, message: "Unable to save team details." }))) as {
      success?: boolean;
      message?: string;
      id?: string;
    };

    if (!response.ok || !result.success) {
      setError(result.message ?? "Unable to save team details.");
      setIsSaving(false);
      return;
    }

    setSuccess("Team details updated successfully.");
    setIsSaving(false);

    const refreshedResponse = await fetch("/api/admin/teams", { cache: "no-store" });
    const refreshed = (await refreshedResponse.json().catch(() => ({ data: [] }))) as {
      data?: TeamRecord[];
    };
    const updated = (Array.isArray(refreshed.data) ? refreshed.data : []).find((item) => item.id === teamId) ?? null;
    setTeam(updated);
  };

  if (!teamId) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200">
          Team id is missing.
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-slate-300">
          Loading team details...
        </div>
      </section>
    );
  }

  if (!team) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200">
          {error ?? "Team not found."}
        </div>
        <div className="mt-4">
          <Link href="/dashboard/team" className="text-cyan-300 underline hover:text-cyan-200">
            Back to teams
          </Link>
        </div>
      </section>
    );
  }

  const players = team.players ?? [];
  const teamUsers = team.users ?? [];

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Team profile</p>
          <h1 className="mt-3 text-3xl font-bold text-white">{team.name}</h1>
        </div>
        <Link
          href="/dashboard/team"
          className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:border-cyan-400"
        >
          Back to list
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center gap-4">
            <img
              src={team.logoUrl || "/logo/ltm.jpg"}
              alt={`${team.name} logo`}
              className="h-20 w-20 rounded-2xl object-cover border border-slate-700"
            />
            <h2 className="text-2xl font-semibold text-white">Overview</h2>
          </div>

          <div className="mt-6 space-y-4 text-sm text-slate-300">
            <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
              <span>Team name</span>
              <strong className="text-white">{team.name}</strong>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
              <span>Players assigned</span>
              <strong className="text-white">{players.length}</strong>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
              <span>Team account</span>
              <strong className="text-white">{teamUsers[0]?.email ?? "Not available"}</strong>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold text-white">Players in this team</h3>
            <div className="mt-4 space-y-3">
              {players.length === 0 ? (
                <p className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3 text-slate-400">
                  No players assigned yet.
                </p>
              ) : (
                players.map((player) => (
                  <div key={player.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{player.name}</p>
                        <p className="text-xs text-slate-400">{player.role ?? "BATSMAN"}</p>
                      </div>
                      <Link
                        href={`/dashboard/player/${player.id}`}
                        className="text-sm text-cyan-300 hover:text-cyan-200"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-2xl font-semibold text-white">Edit team details</h2>

          <div className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Team name</label>
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Team logo URL</label>
              <input
                value={form.logoUrl}
                onChange={(event) => setForm({ ...form, logoUrl: event.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-cyan-500"
                placeholder="/logo/ltm.jpg"
              />
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-2">
                <img
                  src={form.logoUrl || "/logo/ltm.jpg"}
                  alt="Team logo preview"
                  className="h-12 w-12 rounded-lg object-cover"
                />
              </div>
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
            className="mt-6 w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving changes..." : "Save changes"}
          </button>
        </form>
      </div>
    </section>
  );
}
