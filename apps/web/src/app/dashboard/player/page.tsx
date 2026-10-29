import { getCurrentUser, roleLabels } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PlayerDashboardPage() {
  const currentUser = await getCurrentUser();

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 rounded-3xl border border-violet-500/30 bg-violet-500/10 p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-violet-300">
          {currentUser ? `${roleLabels[currentUser.role]} Panel` : "Player Panel"}
        </p>
        <h1 className="mt-3 text-3xl font-bold text-white">
          {currentUser ? `Welcome back, ${currentUser.name}` : "View personal stats and request updates"}
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { title: "My stats", text: "Review goals, fitness, and match performance reports." },
          { title: "Request upgrade", text: "Submit a stat correction or performance improvement request." },
          { title: "Admin review", text: "Await approval from the admin team before final validation." },
        ].map((item) => (
          <article key={item.title} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-xl font-semibold text-white">{item.title}</h2>
            <p className="mt-3 text-slate-300">{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
