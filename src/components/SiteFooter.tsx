import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-600">
          <span className="font-semibold text-[#1B2A4A]">BayDesk</span> ©{" "}
          {new Date().getFullYear()}
        </p>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link
            href="/terms"
            className="text-zinc-600 underline-offset-4 hover:text-[#1B2A4A] hover:underline"
          >
            Terms of Service
          </Link>
          <Link
            href="/privacy"
            className="text-zinc-600 underline-offset-4 hover:text-[#1B2A4A] hover:underline"
          >
            Privacy Policy
          </Link>
          <Link
            href="/refund"
            className="text-zinc-600 underline-offset-4 hover:text-[#1B2A4A] hover:underline"
          >
            Refunds &amp; Cancellation
          </Link>
        </nav>
      </div>
    </footer>
  );
}
