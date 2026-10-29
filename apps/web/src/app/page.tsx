import Link from "next/link";

const roles = [
  {
    title: "Admin",
    accent: "emerald",
    description: "Create players, teams, matches, and verify player stat upgrade requests.",
  },
  {
    title: "Team / Club",
    accent: "cyan",
    description: "Create match schedules, add players, and manage club performance stats.",
  },
  {
    title: "Player",
    accent: "violet",
    description: "View personal stats only and send upgrade requests for admin verification.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-emerald-400">
            Local team management
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Role-based access for every part of the club.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
            LTM gives admins, teams, and players separate permissions so each user only sees
            what they are allowed to manage.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/login"
              className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Login
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:border-slate-500 hover:bg-slate-800"
            >
              Open dashboard
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-emerald-950/30">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Access model</p>
          <div className="mt-6 space-y-5">
            {roles.map((role) => (
              <div
                key={role.title}
                className="rounded-2xl border border-slate-800 bg-slate-950 p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-white">{role.title}</p>
                  <span className="rounded-full border border-slate-700 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-300">
                    {role.accent}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-300">{role.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
