"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@ltm.com");
  const [password, setPassword] = useState("admin123");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [redirectTarget, setRedirectTarget] = useState("/dashboard");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRedirectTarget(params.get("redirect") ?? "/dashboard");
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = (await response.json()) as { success?: boolean; message?: string; redirect?: string };

    if (!response.ok || !data.success) {
      setError(data.message ?? "Unable to sign in.");
      setIsSubmitting(false);
      return;
    }

    router.push(data.redirect ?? redirectTarget);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-12">
      <div className="grid w-full gap-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl shadow-emerald-950/30 lg:grid-cols-[1.1fr_0.9fr]">
        <section>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-emerald-400">LTM Access</p>
          <h1 className="mt-4 text-4xl font-bold text-white">Sign in to the performance dashboard</h1>
          <p className="mt-4 max-w-xl text-slate-300">
            Sign in with your real platform account. The API validates your credentials and stores the JWT in an HTTP-only cookie.
          </p>

          <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            Default admin login: <span className="font-semibold">admin@ltm.com</span> / <span className="font-semibold">admin123</span>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-700 bg-slate-950 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-white outline-none transition focus:border-emerald-500"
                placeholder="admin@ltm.com"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Password</label>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-white outline-none transition focus:border-emerald-500"
                placeholder="Enter password"
                required
              />
            </div>

            {error ? (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-slate-400">
            <Link href="/" className="text-emerald-400 hover:text-emerald-300">
              Back to home
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
