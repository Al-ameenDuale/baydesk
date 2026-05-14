"use client";

import Link from "next/link";
import { displayName, type ProfileRecord } from "@/lib/profileTypes";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
  onNavigate?: () => void;
  onOpenProfile: () => void;
  profile: ProfileRecord | null;
  email: string | null;
  showUpgrade: boolean;
  onLogout: () => void | Promise<void>;
};

const linkClass =
  "flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-zinc-800 hover:bg-zinc-100";

export function Sidebar({
  open,
  onClose,
  onNavigate,
  onOpenProfile,
  profile,
  email,
  showUpgrade,
  onLogout,
}: SidebarProps) {
  function wrapNav() {
    onNavigate?.();
    onClose();
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-200 md:bg-black/30 ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-[min(100%,20rem)] max-w-[100vw] flex-col border-l border-zinc-200 bg-white shadow-xl transition-transform duration-200 ease-out sm:w-80 md:max-w-[20rem] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-900">
              {displayName(profile, email)}
            </p>
            {email && (
              <p className="truncate text-xs text-zinc-500">{email}</p>
            )}
          </div>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
          <Link href="/dashboard" className={linkClass} onClick={wrapNav}>
            Dashboard
          </Link>
          <Link href="/jobs" className={linkClass} onClick={wrapNav}>
            Jobs
          </Link>
          <Link href="/customers" className={linkClass} onClick={wrapNav}>
            Customers
          </Link>
          <Link href="/invoices" className={linkClass} onClick={wrapNav}>
            Invoices
          </Link>
          <button
            type="button"
            className={`${linkClass} w-full text-left`}
            onClick={() => {
              onClose();
              onOpenProfile();
            }}
          >
            Profile
          </button>
          {showUpgrade && (
            <Link
              href="/pricing"
              className={`${linkClass} text-[#1B2A4A]`}
              onClick={wrapNav}
            >
              Upgrade
            </Link>
          )}
        </nav>

        <div className="border-t border-zinc-200 p-3">
          <button
            type="button"
            className="flex min-h-11 w-full items-center justify-center rounded-md border border-zinc-300 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
            onClick={() => void onLogout()}
          >
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
