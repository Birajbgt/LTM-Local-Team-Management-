import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
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
  icons: {
    icon: "/logo/ltm.jpg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#061b2d] text-slate-100">
        <div className="min-h-screen bg-[#061b2d]">
          <header className="border-b border-[#d9b768]/25 bg-[#061b2d]/80 backdrop-blur-sm">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <Link href="/" className="flex items-center gap-3">
                <Image
                  src="/logo/ltm.jpg"
                  alt="LTM logo"
                  width={170}
                  height={70}
                  priority
                  className="h-12 w-auto object-contain"
                />
              </Link>

              <nav className="flex items-center gap-4 text-sm text-slate-200">
                <Link href="/" className="transition hover:text-[#f2d58a]">
                  Home
                </Link>
                <Link href="/login" className="transition hover:text-[#f2d58a]">
                  Login
                </Link>
                <Link href="/dashboard" className="transition hover:text-[#f2d58a]">
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
