import Link from "next/link";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/SiteFooter";

type LegalDocLayoutProps = {
  title: string;
  lastUpdated?: string;
  children: ReactNode;
};

export function LegalDocLayout({
  title,
  lastUpdated = "May 2026",
  children,
}: LegalDocLayoutProps) {
  return (
    <div className="flex min-h-screen min-w-0 flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="min-w-0 text-sm font-medium text-[#1B2A4A] hover:underline"
          >
            ← Back to BayDesk
          </Link>
          <span className="shrink-0 text-xs text-zinc-500">Last updated: {lastUpdated}</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="break-words text-2xl font-semibold tracking-tight text-[#1B2A4A] sm:text-3xl">
          {title}
        </h1>
        <div className="mt-8 space-y-8 text-sm leading-relaxed text-zinc-800">
          {children}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
