import Image from "next/image";
import Link from "next/link";

const roles = [
  {
    title: "Admin",
    accent: "Admin",
    description: "Create players, teams, matches, and verify player stat upgrade requests.",
  },
  {
    title: "Team / Club",
    accent: "Club",
    description: "Create match schedules, add players, and manage club performance stats.",
  },
  {
    title: "Player",
    accent: "Player",
    description: "View personal stats only and send upgrade requests for admin verification.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-[#d9b768]">
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
              className="rounded-full bg-[#d9b768] px-5 py-3 text-sm font-semibold text-[#081d30] transition hover:bg-[#f2d58a]"
            >
              Login
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-[#d9b768]/40 bg-[#0d2340] px-5 py-3 text-sm font-semibold text-white transition hover:border-[#f2d58a] hover:bg-[#122d4d]"
            >
              Open dashboard
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-[#d9b768]/30 bg-[#0d2340]/80 p-8 shadow-2xl shadow-[#0b1e34]/60">
          <div className="mb-6 flex justify-center">
            <Image
              src="/logo/ltm.jpg"
              alt="LTM logo"
              width={420}
              height={320}
              priority
              className="h-auto max-w-full rounded-2xl"
            />
          </div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Access model</p>
          <div className="mt-6 space-y-5">
            {roles.map((role) => (
              <div
                key={role.title}
                className="rounded-2xl border border-[#d9b768]/20 bg-[#081d30] p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-white">{role.title}</p>
                  <span className="rounded-full border border-[#d9b768]/30 bg-[#d9b768]/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-[#f2d58a]">
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
