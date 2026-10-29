import { getCurrentUser, roleLabels } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function TeamDashboardPage() {
  const currentUser = await getCurrentUser();

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 rounded-3xl border border-cyan-500/30 bg-cyan-500/10 p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
          {currentUser ? `${roleLabels[currentUser.role]}` : "Team / Club"}
        </p>
        <h1 className="mt-3 text-3xl font-bold text-white">
          {currentUser ? `Welcome back, ${currentUser.name}` : "Manage roster, fixtures, and player performance"}
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { title: "Create match", text: "Set new fixtures and decide club responsibilities." },
          { title: "Add players", text: "Add athletes to the roster and assign primary positions." },
          { title: "Player stats", text: "Track match stats, fitness metrics, and training output." },
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
