export default function Home() {
  return (
    <div className="min-h-screen bg-white text-[#0f172a]">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="text-sm font-semibold tracking-wide text-[#1B2A4A]">
            GarageOS
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
        <section className="mx-auto w-full max-w-6xl px-6 py-16">
          <div className="max-w-3xl">
            <h1 className="text-balance text-4xl font-semibold leading-tight text-[#1B2A4A] sm:text-5xl">
              The operating system for your repair shop
            </h1>
            <p className="mt-5 text-pretty text-base leading-relaxed text-zinc-700 sm:text-lg">
              GarageOS helps independent auto repair shops track jobs, manage customers,
              generate invoices, and monitor income — all in one place.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="/signup"
                className="inline-flex h-11 items-center justify-center rounded-md bg-[#1B2A4A] px-6 text-sm font-semibold text-white shadow-sm hover:bg-[#15213a]"
              >
                Start free trial
              </a>
              <a
                href="/pricing"
                className="inline-flex h-11 items-center justify-center rounded-md border border-zinc-300 bg-white px-6 text-sm font-semibold text-[#1B2A4A] hover:bg-zinc-50"
              >
                View pricing
              </a>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-16">
          <h2 className="text-xl font-semibold text-[#1B2A4A]">Features</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1B2A4A]">Job Tracking</h3>
              <p className="mt-2 text-sm text-zinc-700">
                Track every job from intake to completion in one list.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1B2A4A]">Customer Management</h3>
              <p className="mt-2 text-sm text-zinc-700">
                Keep customer details organized and easy to find.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1B2A4A]">Invoicing</h3>
              <p className="mt-2 text-sm text-zinc-700">
                Generate clean invoices and mark them paid or unpaid.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1B2A4A]">Income Dashboard</h3>
              <p className="mt-2 text-sm text-zinc-700">
                Monitor revenue and outstanding balances at a glance.
              </p>
            </div>
          </div>
        </section>

        {/* Who it's for */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-16">
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
        <section className="mx-auto w-full max-w-6xl px-6 pb-16">
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
        <section className="mx-auto w-full max-w-6xl px-6 pb-16">
          <h2 className="text-xl font-semibold text-[#1B2A4A]">Frequently asked questions</h2>
          <div className="mt-6 divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white shadow-sm">
            <details className="group px-6 py-4">
              <summary className="cursor-pointer list-none text-sm font-semibold text-[#1B2A4A]">
                Do I need a credit card to start?
              </summary>
              <p className="mt-2 text-sm text-zinc-700">
                No. Your 14-day free trial requires no card details.
              </p>
            </details>
            <details className="group px-6 py-4">
              <summary className="cursor-pointer list-none text-sm font-semibold text-[#1B2A4A]">
                Can I cancel anytime?
              </summary>
              <p className="mt-2 text-sm text-zinc-700">Yes. No contracts, no commitments.</p>
            </details>
            <details className="group px-6 py-4">
              <summary className="cursor-pointer list-none text-sm font-semibold text-[#1B2A4A]">
                Does it work on mobile?
              </summary>
              <p className="mt-2 text-sm text-zinc-700">
                Yes. GarageOS works on any device with a browser.
              </p>
            </details>
            <details className="group px-6 py-4">
              <summary className="cursor-pointer list-none text-sm font-semibold text-[#1B2A4A]">
                What happens after my trial ends?
              </summary>
              <p className="mt-2 text-sm text-zinc-700">
                You&apos;ll be prompted to upgrade to keep access. Plans start at $49.99/month.
              </p>
            </details>
          </div>
        </section>

        {/* Pricing */}
        <section className="border-t border-zinc-200 bg-white">
          <div className="mx-auto w-full max-w-6xl px-6 py-16">
            <h2 className="text-xl font-semibold text-[#1B2A4A]">Pricing</h2>
            <div className="mt-6 max-w-xl rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
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
                className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-[#1B2A4A] px-6 text-sm font-semibold text-white hover:bg-[#15213a]"
              >
                Start free trial
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto w-full max-w-6xl px-6 py-8 text-sm text-zinc-600">
          <span className="font-semibold text-[#1B2A4A]">GarageOS</span> ©{" "}
          {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
