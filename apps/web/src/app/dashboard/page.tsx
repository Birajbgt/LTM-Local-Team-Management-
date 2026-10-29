import { getCurrentUser, roleLabels } from "@/lib/auth";

export const dynamic = "force-dynamic";

const overviewItems = [
  { title: "Manage players", text: "Create, edit, and review cricket player profiles." },
  { title: "Manage teams", text: "Create clubs, assign players, and manage squad rosters." },
  { title: "Matches & stats", text: "Create fixtures, scorecards, and validate player performance data." },
  { title: "Request updates", text: "Players can request stat reviews for admin verification." },
];

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl shadow-emerald-950/30">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">Dashboard</p>
        <h1 className="mt-4 text-4xl font-bold text-white">
          {currentUser ? `Welcome back, ${currentUser.name}` : "Cricket operations dashboard"}
        </h1>
        <p className="mt-3 text-lg text-slate-300">
          {currentUser
            ? `You are signed in as ${roleLabels[currentUser.role]} and can access your workspace.`
            : "Admins, teams, and players each have a separate cricket management workspace."}
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {overviewItems.map((item) => (
          <article key={item.title} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold text-white">{item.title}</h2>
            <p className="mt-3 text-slate-300">{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
