import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 text-center sm:px-6 lg:px-8">
        <nav
          className="flex flex-wrap items-center justify-center gap-x-2 text-sm text-zinc-600"
          aria-label="Legal"
        >
          <Link
            href="/terms"
            className="hover:text-[#1B2A4A] hover:underline"
          >
            Terms of Service
          </Link>
          <span className="text-zinc-300 select-none" aria-hidden>
            |
          </span>
          <Link
            href="/privacy"
            className="hover:text-[#1B2A4A] hover:underline"
          >
            Privacy Policy
          </Link>
          <span className="text-zinc-300 select-none" aria-hidden>
            |
          </span>
          <Link
            href="/refund"
            className="hover:text-[#1B2A4A] hover:underline"
          >
            Refund Policy
          </Link>
        </nav>
        <p className="mt-3 text-sm text-zinc-500">
          © {year} BayDesk
        </p>
      </div>
    </footer>
  );
}
