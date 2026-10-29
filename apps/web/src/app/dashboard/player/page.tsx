"use client";

import { FormEvent, useEffect, useState } from "react";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type PlayerData = {
  id: string;
  name: string;
  role?: string;
  profileImageUrl?: string;
  team?: { name?: string } | null;
  matchesPlayed?: number;
  totalRuns?: number;
  totalWickets?: number;
  basePrice?: number;
};

type TicketData = {
  id: string;
  status?: string;
  fieldName?: string;
  currentValue?: string;
  requestedValue?: string;
  reason?: string;
};

export default function PlayerDashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [profileForm, setProfileForm] = useState({ email: "", password: "" });
  const [ticketForm, setTicketForm] = useState({
    fieldName: "totalRuns",
    currentValue: "0",
    requestedValue: "0",
    reason: "",
  });
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [meResponse, playersResponse, ticketsResponse] = await Promise.all([
          fetch("/api/auth/profile", { cache: "no-store" }),
          fetch("/api/admin/players", { cache: "no-store" }),
          fetch("/api/stat-upgrades", { cache: "no-store" }),
        ]);

        const meResult = (await meResponse.json().catch(() => ({ success: false, data: null }))) as {
          success?: boolean;
          data?: UserProfile;
        };
        const playersResult = (await playersResponse.json().catch(() => ({ data: [] }))) as {
          success?: boolean;
          data?: PlayerData[];
        };
        const ticketsResult = (await ticketsResponse.json().catch(() => ({ data: [] }))) as {
          success?: boolean;
          data?: TicketData[];
        };

        if (meResult.success && meResult.data) {
          setUser(meResult.data);
          setProfileForm((current) => ({ ...current, email: meResult.data?.email ?? "" }));
        }

        const currentPlayer = Array.isArray(playersResult.data) && playersResult.data.length > 0 ? playersResult.data[0] : null;
        setPlayer(currentPlayer);
        setTicketForm((current) => ({
          ...current,
          currentValue: String(currentPlayer?.totalRuns ?? 0),
          requestedValue: String(currentPlayer?.totalRuns ?? 0),
        }));
        setTickets(Array.isArray(ticketsResult.data) ? ticketsResult.data : []);
      } catch {
        setStatus({
          type: "error",
          message: "Unable to load your dashboard data.",
        });
      }
    };

    void loadData();
  }, []);

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmittingProfile(true);
    setStatus(null);

    const response = await fetch("/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: profileForm.email.trim(),
        password: profileForm.password.trim(),
      }),
    });

    const result = (await response.json()) as { success?: boolean; message?: string };

    if (!response.ok || !result.success) {
      setStatus({
        type: "error",
        message: result.message ?? "Unable to update profile.",
      });
      setIsSubmittingProfile(false);
      return;
    }

    setStatus({
      type: "success",
      message: result.message ?? "Profile updated successfully.",
    });
    setProfileForm({ email: user?.email ?? "", password: "" });
    setIsSubmittingProfile(false);
  };

  const handleTicketSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmittingTicket(true);
    setStatus(null);

    const response = await fetch("/api/stat-upgrades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fieldName: ticketForm.fieldName,
        currentValue: ticketForm.currentValue,
        requestedValue: ticketForm.requestedValue,
        reason: ticketForm.reason,
      }),
    });

    const result = (await response.json()) as { success?: boolean; message?: string };

    if (!response.ok || !result.success) {
      setStatus({
        type: "error",
        message: result.message ?? "Unable to submit the upgrade ticket.",
      });
      setIsSubmittingTicket(false);
      return;
    }

    setStatus({
      type: "success",
      message: result.message ?? "Ticket submitted successfully.",
    });
    setTicketForm({
      fieldName: "totalRuns",
      currentValue: String(player?.totalRuns ?? 0),
      requestedValue: String(player?.totalRuns ?? 0),
      reason: "",
    });
    setIsSubmittingTicket(false);

    const refreshed = await fetch("/api/stat-upgrades", { cache: "no-store" });
    const refreshedTickets = (await refreshed.json().catch(() => ({ data: [] }))) as { data?: TicketData[] };
    setTickets(Array.isArray(refreshedTickets.data) ? refreshedTickets.data : []);
  };

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 rounded-3xl border border-violet-500/30 bg-violet-500/10 p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Player Panel</p>
        <h1 className="mt-3 text-3xl font-bold text-white">Welcome back, {user?.name ?? "Player"}</h1>
      </div>

      {status ? (
        <div className={`mb-8 rounded-xl border px-4 py-3 text-sm ${status.type === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-rose-500/30 bg-rose-500/10 text-rose-200"}`}>
          {status.message}
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-xl font-semibold text-white">My stats</h2>
          <p className="mt-3 text-slate-300">Runs: {player?.totalRuns ?? 0} · Wickets: {player?.totalWickets ?? 0}</p>
        </article>
        <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-xl font-semibold text-white">Request upgrade</h2>
          <p className="mt-3 text-slate-300">Submit a stat review for admin approval.</p>
        </article>
        <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-xl font-semibold text-white">Admin review</h2>
          <p className="mt-3 text-slate-300">Await approval before final validation.</p>
        </article>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <form onSubmit={handleTicketSubmit} className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Request stat upgrade</h2>
            <span className="text-xs uppercase tracking-[0.2em] text-violet-400">Ticket</span>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Field</label>
              <select
                value={ticketForm.fieldName}
                onChange={(event) => setTicketForm({ ...ticketForm, fieldName: event.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-violet-500"
              >
                <option value="totalRuns">Total Runs</option>
                <option value="totalWickets">Total Wickets</option>
                <option value="matchesPlayed">Matches Played</option>
                <option value="basePrice">Base Price</option>
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Current value</label>
                <input
                  type="number"
                  min="0"
                  value={ticketForm.currentValue}
                  onChange={(event) => setTicketForm({ ...ticketForm, currentValue: event.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-violet-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Requested value</label>
                <input
                  type="number"
                  min="0"
                  value={ticketForm.requestedValue}
                  onChange={(event) => setTicketForm({ ...ticketForm, requestedValue: event.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-violet-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Reason</label>
              <textarea
                value={ticketForm.reason}
                onChange={(event) => setTicketForm({ ...ticketForm, reason: event.target.value })}
                className="min-h-28 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-violet-500"
                placeholder="Explain the improvement you want reviewed."
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingTicket}
              className="w-full rounded-xl bg-violet-500 px-4 py-3 font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmittingTicket ? "Sending ticket..." : "Submit ticket"}
            </button>
          </div>
        </form>

        <form onSubmit={handleProfileSubmit} className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Profile settings</h2>
            <span className="text-xs uppercase tracking-[0.2em] text-cyan-400">Edit</span>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(event) => setProfileForm({ ...profileForm, email: event.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-violet-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Password</label>
              <input
                type="password"
                value={profileForm.password}
                onChange={(event) => setProfileForm({ ...profileForm, password: event.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-violet-500"
                placeholder="New password"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingProfile}
              className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmittingProfile ? "Saving profile..." : "Save profile"}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">My tickets</h2>
          <span className="text-xs uppercase tracking-[0.2em] text-violet-400">History</span>
        </div>

        <div className="space-y-3">
          {tickets.length === 0 ? (
            <p className="text-sm text-slate-400">No tickets created yet.</p>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{ticket.fieldName ?? "Stat"}</p>
                    <p className="text-xs text-slate-400">{ticket.currentValue ?? "0"} → {ticket.requestedValue ?? "0"}</p>
                  </div>
                  <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-violet-300">
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
