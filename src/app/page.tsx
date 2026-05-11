export default function Home() {
  return (
    <div className="min-h-screen bg-white text-[#0f172a]">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="text-sm font-semibold tracking-wide text-[#1B2A4A]">
            BayDesk
          </div>
          <nav className="flex items-center gap-3">
            <a
              href="/login"
              className="text-sm font-medium text-zinc-700 hover:text-[#1B2A4A] hover:underline"
            >
              Log in
            </a>
            <a
              href="/signup"
              className="inline-flex h-9 items-center justify-center rounded-md bg-[#1B2A4A] px-4 text-sm font-semibold text-white hover:bg-[#15213a]"
            >
              Start free trial
            </a>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="bg-[#1B2A4A]">
          <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-24">
            <div className="max-w-3xl">
              <h1 className="text-balance text-4xl font-semibold leading-tight text-white sm:text-5xl">
                The operating system for your repair shop
              </h1>
              <p className="mt-5 text-pretty text-base leading-relaxed text-white/85 sm:text-lg">
                BayDesk helps independent auto repair shops track jobs, manage customers,
                generate invoices, and monitor income — all in one place.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href="/signup"
                  className="inline-flex h-12 items-center justify-center rounded-md bg-white px-7 text-sm font-semibold text-[#1B2A4A] shadow-sm hover:bg-zinc-100"
                >
                  Start free trial
                </a>
                <a
                  href="/pricing"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-white/30 bg-transparent px-7 text-sm font-semibold text-white hover:bg-white/10"
                >
                  View pricing
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto w-full max-w-6xl px-6 py-20">
          <h2 className="text-xl font-semibold text-[#1B2A4A]">Features</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <h3 className="text-sm font-semibold text-[#1B2A4A]">Job Tracking</h3>
              <p className="mt-2 text-sm text-zinc-700">
                Track every job from intake to completion in one list.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <h3 className="text-sm font-semibold text-[#1B2A4A]">Customer Management</h3>
              <p className="mt-2 text-sm text-zinc-700">
                Keep customer details organized and easy to find.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <h3 className="text-sm font-semibold text-[#1B2A4A]">Invoicing</h3>
              <p className="mt-2 text-sm text-zinc-700">
                Generate clean invoices and mark them paid or unpaid.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <h3 className="text-sm font-semibold text-[#1B2A4A]">Income Dashboard</h3>
              <p className="mt-2 text-sm text-zinc-700">
                Monitor revenue and outstanding balances at a glance.
              </p>
            </div>
          </div>
        </section>

        {/* Who it's for */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-20">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#1B2A4A]">
              Built for independent repair shops
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-zinc-700">
              <li>Solo mechanics and small shops tired of paper and spreadsheets</li>
              <li>Shop owners who want simple invoicing without expensive software</li>
              <li>Anyone managing jobs, customers, and income across 1-5 staff</li>
            </ul>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-20">
          <h2 className="text-xl font-semibold text-[#1B2A4A]">Up and running in minutes</h2>
          <ol className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <li className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#1B2A4A] text-sm font-semibold text-white">
                  1
                </span>
                <h3 className="text-sm font-semibold text-[#1B2A4A]">Step 1</h3>
              </div>
              <p className="mt-3 text-sm text-zinc-700">
                Create your account and start your free 14-day trial
              </p>
            </li>
            <li className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#1B2A4A] text-sm font-semibold text-white">
                  2
                </span>
                <h3 className="text-sm font-semibold text-[#1B2A4A]">Step 2</h3>
              </div>
              <p className="mt-3 text-sm text-zinc-700">Add your customers, cars, and jobs</p>
            </li>
            <li className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#1B2A4A] text-sm font-semibold text-white">
                  3
                </span>
                <h3 className="text-sm font-semibold text-[#1B2A4A]">Step 3</h3>
              </div>
              <p className="mt-3 text-sm text-zinc-700">
                Generate invoices and track your income
              </p>
            </li>
          </ol>
        </section>

        {/* FAQ */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-20">
          <h2 className="text-xl font-semibold text-[#1B2A4A]">Frequently asked questions</h2>
          <div className="mt-6 divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white shadow-sm">
            <details className="group px-6 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-[#1B2A4A]">
                <span>Do I need a credit card to start?</span>
                <span className="text-[#1B2A4A]/60 transition-transform group-open:rotate-180">
                  ▾
                </span>
              </summary>
              <p className="mt-2 text-sm text-zinc-700">
                No. Your 14-day free trial requires no card details.
              </p>
            </details>
            <details className="group px-6 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-[#1B2A4A]">
                <span>Can I cancel anytime?</span>
                <span className="text-[#1B2A4A]/60 transition-transform group-open:rotate-180">
                  ▾
                </span>
              </summary>
              <p className="mt-2 text-sm text-zinc-700">Yes. No contracts, no commitments.</p>
            </details>
            <details className="group px-6 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-[#1B2A4A]">
                <span>Does it work on mobile?</span>
                <span className="text-[#1B2A4A]/60 transition-transform group-open:rotate-180">
                  ▾
                </span>
              </summary>
              <p className="mt-2 text-sm text-zinc-700">
                Yes. BayDesk works on any device with a browser.
              </p>
            </details>
            <details className="group px-6 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-[#1B2A4A]">
                <span>What happens after my trial ends?</span>
                <span className="text-[#1B2A4A]/60 transition-transform group-open:rotate-180">
                  ▾
                </span>
              </summary>
              <p className="mt-2 text-sm text-zinc-700">
                You&apos;ll be prompted to upgrade to keep access. Plans start at $49.99/month.
              </p>
            </details>
          </div>
        </section>

        {/* Pricing */}
        <section className="border-t border-zinc-200 bg-white">
          <div className="mx-auto w-full max-w-6xl px-6 py-20">
            <h2 className="text-xl font-semibold text-[#1B2A4A]">Pricing</h2>
            <div className="mt-8 flex justify-center">
              <div className="w-full max-w-xl rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <h3 className="text-base font-semibold text-[#1B2A4A]">Pro</h3>
                    <p className="mt-1 text-sm text-zinc-700">
                      Everything you need to run a small shop.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-semibold text-[#1B2A4A]">$49.99</div>
                    <div className="text-sm text-zinc-600">per month</div>
                  </div>
                </div>

                <div className="mt-6 rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
                  14-day free trial. No card required.
                </div>

                <a
                  href="/signup"
                  className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-md border border-[#1B2A4A] bg-white px-6 text-sm font-semibold text-[#1B2A4A] hover:bg-zinc-50"
                >
                  Start free trial
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto w-full max-w-6xl px-6 py-8 text-sm text-zinc-600">
          <span className="font-semibold text-[#1B2A4A]">BayDesk</span> ©{" "}
          {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
