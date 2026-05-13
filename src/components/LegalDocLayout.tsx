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
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-6 py-4">
          <Link
            href="/"
            className="text-sm font-medium text-[#1B2A4A] hover:underline"
          >
            ← Back to BayDesk
          </Link>
          <span className="text-xs text-zinc-500">Last updated: {lastUpdated}</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight text-[#1B2A4A]">
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
