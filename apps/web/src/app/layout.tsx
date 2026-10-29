import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LTM | Cricket Performance Platform",
  description: "Cricket player management, team operations, and stat review workflow",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-950 text-slate-100">
        <div className="min-h-screen bg-slate-950">
          <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <Link href="/" className="text-lg font-bold tracking-[0.2em] text-emerald-400">
                LTM
              </Link>

              <nav className="flex items-center gap-4 text-sm text-slate-300">
                <Link href="/" className="transition hover:text-white">
                  Home
                </Link>
                <Link href="/login" className="transition hover:text-white">
                  Login
                </Link>
                <Link href="/dashboard" className="transition hover:text-white">
                  Dashboard
                </Link>
              </nav>
            </div>
          </header>

          {children}
        </div>
      </body>
    </html>
  );
}
