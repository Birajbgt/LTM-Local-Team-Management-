const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <header className="mb-10 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-emerald-400">
              LTM
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Sports performance platform
            </h1>
          </div>
          <div className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300">
            API: {apiUrl}
          </div>
        </header>

        <section className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="mb-6 inline-flex w-fit items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-300">
              NestJS + React + Tailwind
            </div>

            <h2 className="max-w-xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Built for fast product delivery and reliable backend data.
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              A modern monorepo with a PostgreSQL-backed NestJS API and a polished Next.js
              frontend, all configured for local development and production-ready growth.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href={`${apiUrl}/api`}
                className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Open API
              </a>

              <a
                href="http://localhost:3000"
                className="rounded-full border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:border-slate-500 hover:bg-slate-800"
              >
                View Frontend
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-emerald-950/40">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
              Stack status
            </p>

            <div className="mt-6 space-y-5">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">API</p>
                <p className="mt-2 text-2xl font-semibold text-emerald-400">Online</p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">DB</p>
                <p className="mt-2 text-2xl font-semibold text-cyan-400">Postgres</p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Frontend</p>
                <p className="mt-2 text-2xl font-semibold text-violet-400">Next.js</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
