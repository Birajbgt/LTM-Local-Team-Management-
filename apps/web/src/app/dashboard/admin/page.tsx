import { getCurrentUser, roleLabels } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const currentUser = await getCurrentUser();

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">
          {currentUser ? `${roleLabels[currentUser.role]} Console` : "Admin Console"}
        </p>
        <h1 className="mt-3 text-3xl font-bold text-white">
          {currentUser ? `Welcome back, ${currentUser.name}` : "Manage the full cricket ecosystem"}
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Create player", text: "Add athlete profiles and assign team status." },
          { title: "Create team", text: "Register clubs, groups, and coaching units." },
          { title: "Create match", text: "Schedule fixtures and assign competitions." },
          { title: "Verify stat upgrades", text: "Review player requests and approve updates." },
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
