"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { hasFreeTrialAccess, subscriptionIsActive } from "@/lib/trial";

type InvoiceStatus = "paid" | "unpaid";

type InvoiceRow = {
  id: string;
  job_id: string;
  total_amount_cents: number;
  status: InvoiceStatus;
  created_at: string;
};

type JobRow = {
  id: string;
  description: string | null;
  customer_id: string;
};

type CustomerRow = {
  id: string;
  name: string;
};

type RevenueRow = {
  invoiceId: string;
  customerName: string;
  jobDescription: string;
  amountCents: number;
  createdAt: string;
};

function formatMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function toStartOfDayISO(dateStr: string) {
  // dateStr is YYYY-MM-DD from <input type="date" />
  return new Date(`${dateStr}T00:00:00.000`).toISOString();
}

function toEndOfDayISO(dateStr: string) {
  return new Date(`${dateStr}T23:59:59.999`).toISOString();
}

function JobsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function CustomersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function InvoicesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}

export default function DashboardPage() {
  const [checking, setChecking] = useState(true);

  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [totalRevenueCents, setTotalRevenueCents] = useState(0);
  const [outstandingCents, setOutstandingCents] = useState(0);
  const [jobsThisMonth, setJobsThisMonth] = useState(0);
  const [activeJobsCount, setActiveJobsCount] = useState(0);
  const [totalJobsCount, setTotalJobsCount] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [unpaidInvoicesCount, setUnpaidInvoicesCount] = useState(0);

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const yyyyMmDd = (d: Date) => d.toISOString().slice(0, 10);

  const [rangeStart, setRangeStart] = useState(yyyyMmDd(firstDayOfMonth));
  const [rangeEnd, setRangeEnd] = useState(yyyyMmDd(today));
  const [loadingRevenue, setLoadingRevenue] = useState(false);
  const [revenueError, setRevenueError] = useState<string | null>(null);
  const [revenueRows, setRevenueRows] = useState<RevenueRow[]>([]);
  const [rangeRevenueCents, setRangeRevenueCents] = useState(0);

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // Avoid hydration-time router initialization edge cases
        window.location.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_status, created_at")
        .eq("id", session.user.id)
        .single();

      const status = profile?.subscription_status ?? null;
      const createdAt =
        (profile?.created_at as string | undefined) ?? session.user.created_at ?? null;
      const allowed =
        subscriptionIsActive(status) || hasFreeTrialAccess(createdAt, status);
      if (!allowed) {
        window.location.replace("/trial-expired");
        return;
      }

      setChecking(false);
    }

    checkSession();
  }, []);

  async function loadSummary() {
    setLoadingSummary(true);
    setSummaryError(null);

    const { data: invoices, error: invErr } = await supabase
      .from("invoices")
      .select("status, total_amount_cents");

    if (invErr) {
      setLoadingSummary(false);
      setSummaryError(invErr.message);
      return;
    }

    let paid = 0;
    let unpaid = 0;
    let unpaidInvoiceRows = 0;
    for (const row of (invoices ?? []) as Array<{
      status: InvoiceStatus;
      total_amount_cents: number;
    }>) {
      if (row.status === "paid") paid += row.total_amount_cents;
      else {
        unpaid += row.total_amount_cents;
        unpaidInvoiceRows += 1;
      }
    }
    setTotalRevenueCents(paid);
    setOutstandingCents(unpaid);
    setUnpaidInvoicesCount(unpaidInvoiceRows);

    const monthStartIso = new Date(
      today.getFullYear(),
      today.getMonth(),
      1,
      0,
      0,
      0,
      0
    ).toISOString();

    const { data: allJobs, error: jobsErr } = await supabase
      .from("jobs")
      .select("id, created_at, status");

    if (jobsErr) {
      setLoadingSummary(false);
      setSummaryError(jobsErr.message);
      return;
    }

    const jobRows = (allJobs ?? []) as Array<{
      id: string;
      created_at: string;
      status: string;
    }>;
    let thisMonth = 0;
    let active = 0;
    for (const j of jobRows) {
      if (j.created_at >= monthStartIso) thisMonth += 1;
      if (j.status === "pending" || j.status === "in_progress") active += 1;
    }
    setJobsThisMonth(thisMonth);
    setActiveJobsCount(active);
    setTotalJobsCount(jobRows.length);

    const { data: custs, error: custErr } = await supabase
      .from("customers")
      .select("id");

    setLoadingSummary(false);

    if (custErr) {
      setSummaryError(custErr.message);
      return;
    }
    setTotalCustomers((custs ?? []).length);
  }

  async function loadRevenueInRange() {
    setLoadingRevenue(true);
    setRevenueError(null);

    const startIso = toStartOfDayISO(rangeStart);
    const endIso = toEndOfDayISO(rangeEnd);

    const { data: paidInvoices, error: paidErr } = await supabase
      .from("invoices")
      .select("id, job_id, total_amount_cents, status, created_at")
      .eq("status", "paid")
      .gte("created_at", startIso)
      .lte("created_at", endIso)
      .order("created_at", { ascending: false });

    if (paidErr) {
      setLoadingRevenue(false);
      setRevenueError(paidErr.message);
      return;
    }

    const invList = (paidInvoices ?? []) as InvoiceRow[];
    if (invList.length === 0) {
      setRevenueRows([]);
      setRangeRevenueCents(0);
      setLoadingRevenue(false);
      return;
    }

    const { data: jobs, error: jobsErr } = await supabase
      .from("jobs")
      .select("id, description, customer_id")
      .in(
        "id",
        invList.map((i) => i.job_id)
      );

    if (jobsErr) {
      setLoadingRevenue(false);
      setRevenueError(jobsErr.message);
      return;
    }

    const jobsById: Record<string, JobRow> = {};
    const customerIds: string[] = [];
    for (const j of (jobs ?? []) as JobRow[]) {
      jobsById[j.id] = j;
      customerIds.push(j.customer_id);
    }

    const uniqueCustomerIds = Array.from(new Set(customerIds));
    const { data: custs, error: custErr } = await supabase
      .from("customers")
      .select("id, name")
      .in("id", uniqueCustomerIds);

    setLoadingRevenue(false);

    if (custErr) {
      setRevenueError(custErr.message);
      return;
    }

    const customersById: Record<string, CustomerRow> = {};
    for (const c of (custs ?? []) as CustomerRow[]) customersById[c.id] = c;

    let total = 0;
    const rows: RevenueRow[] = invList.map((inv) => {
      total += inv.total_amount_cents;
      const job = jobsById[inv.job_id];
      const customer = job ? customersById[job.customer_id] : undefined;
      return {
        invoiceId: inv.id,
        customerName: customer?.name ?? "—",
        jobDescription: job?.description ?? "—",
        amountCents: inv.total_amount_cents,
        createdAt: inv.created_at,
      };
    });

    setRangeRevenueCents(total);
    setRevenueRows(rows);
  }

  useEffect(() => {
    if (!checking) {
      void loadSummary();
      void loadRevenueInRange();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checking]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <p className="text-sm text-zinc-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-0 bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto w-full max-w-6xl">
          <h1 className="min-w-0 text-lg font-semibold text-zinc-900">BayDesk Dashboard</h1>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 md:py-8">
        {summaryError && (
          <section className="rounded-lg border border-red-200 bg-white p-4 text-sm text-red-700">
            {summaryError}
          </section>
        )}

        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-semibold text-zinc-900">Welcome back</h2>
          <p className="mt-1 max-w-2xl text-sm text-zinc-600">
            Jump into your day—open jobs, customers, or invoices from here or from the app menu.
          </p>
        </section>

        <section aria-label="Quick navigation">
          <h3 className="sr-only">Quick access</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link
              href="/jobs"
              className="group flex min-h-[5.75rem] flex-col rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-[#1B2A4A]/35 hover:shadow-md focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#1B2A4A] focus-visible:ring-offset-2 sm:min-h-0 sm:flex-row sm:items-stretch sm:gap-4"
            >
              <div className="mb-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#1B2A4A]/10 text-[#1B2A4A] sm:mb-0">
                <JobsIcon className="h-6 w-6" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center">
                <span className="text-sm font-semibold text-zinc-900 group-hover:text-[#1B2A4A]">
                  View Jobs
                </span>
                <p className="mt-1 text-sm text-zinc-600">
                  {loadingSummary ? (
                    <span className="text-zinc-400">Loading counts…</span>
                  ) : (
                    <>
                      <span className="font-medium text-zinc-800">
                        {activeJobsCount === 1 ? "1 active job" : `${activeJobsCount} active jobs`}
                      </span>
                      {totalJobsCount > 0 && totalJobsCount !== activeJobsCount && (
                        <span className="text-zinc-500"> · {totalJobsCount} total</span>
                      )}
                    </>
                  )}
                </p>
              </div>
            </Link>

            <Link
              href="/customers"
              className="group flex min-h-[5.75rem] flex-col rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-[#1B2A4A]/35 hover:shadow-md focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#1B2A4A] focus-visible:ring-offset-2 sm:min-h-0 sm:flex-row sm:items-stretch sm:gap-4"
            >
              <div className="mb-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#1B2A4A]/10 text-[#1B2A4A] sm:mb-0">
                <CustomersIcon className="h-6 w-6" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center">
                <span className="text-sm font-semibold text-zinc-900 group-hover:text-[#1B2A4A]">
                  View Customers
                </span>
                <p className="mt-1 text-sm text-zinc-600">
                  {loadingSummary ? (
                    <span className="text-zinc-400">Loading counts…</span>
                  ) : (
                    <span className="font-medium text-zinc-800">
                      {totalCustomers === 1 ? "1 customer" : `${totalCustomers} customers`}
                    </span>
                  )}
                </p>
              </div>
            </Link>

            <Link
              href="/invoices"
              className="group flex min-h-[5.75rem] flex-col rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-[#1B2A4A]/35 hover:shadow-md focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#1B2A4A] focus-visible:ring-offset-2 sm:min-h-0 sm:flex-row sm:items-stretch sm:gap-4"
            >
              <div className="mb-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#1B2A4A]/10 text-[#1B2A4A] sm:mb-0">
                <InvoicesIcon className="h-6 w-6" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center">
                <span className="text-sm font-semibold text-zinc-900 group-hover:text-[#1B2A4A]">
                  View Invoices
                </span>
                <p className="mt-1 text-sm text-zinc-600">
                  {loadingSummary ? (
                    <span className="text-zinc-400">Loading counts…</span>
                  ) : (
                    <span className="font-medium text-zinc-800">
                      {unpaidInvoicesCount === 1
                        ? "1 unpaid invoice"
                        : `${unpaidInvoicesCount} unpaid invoices`}
                    </span>
                  )}
                </p>
              </div>
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-zinc-500">Total revenue</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900">
              {formatMoney(totalRevenueCents)}
            </p>
            <p className="mt-1 text-xs text-zinc-500">Sum of paid invoices</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-zinc-500">Outstanding amount</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900">
              {formatMoney(outstandingCents)}
            </p>
            <p className="mt-1 text-xs text-zinc-500">Sum of unpaid invoices</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-zinc-500">Total jobs this month</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900">{jobsThisMonth}</p>
            <p className="mt-1 text-xs text-zinc-500">Created since month start</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-zinc-500">Total customers</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900">{totalCustomers}</p>
            <p className="mt-1 text-xs text-zinc-500">All customers</p>
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-zinc-200 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">Revenue</h2>
              <p className="mt-1 text-sm text-zinc-600">
                Paid invoices from {rangeStart} to {rangeEnd}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-600">
                  Start
                </label>
                <input
                  type="date"
                  value={rangeStart}
                  onChange={(e) => setRangeStart(e.target.value)}
                  className="h-11 w-full min-w-0 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-600">
                  End
                </label>
                <input
                  type="date"
                  value={rangeEnd}
                  onChange={(e) => setRangeEnd(e.target.value)}
                  className="h-11 w-full min-w-0 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                />
              </div>
              <button
                onClick={() => void loadRevenueInRange()}
                disabled={loadingRevenue}
                className="h-11 min-h-11 rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
              >
                {loadingRevenue ? "Loading..." : "Apply"}
              </button>
              <button
                onClick={() => void loadSummary()}
                disabled={loadingSummary}
                className="h-11 min-h-11 rounded-md border border-zinc-300 px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-100 disabled:opacity-60"
              >
                {loadingSummary ? "Refreshing..." : "Refresh totals"}
              </button>
            </div>
          </div>

          <div className="px-4 py-4 sm:px-6">
            {revenueError && (
              <p className="mb-3 text-sm text-red-600" role="alert">
                {revenueError}
              </p>
            )}
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-600">
                Revenue in range:{" "}
                <span className="font-semibold text-zinc-900">
                  {formatMoney(rangeRevenueCents)}
                </span>
              </p>
            </div>
          </div>

          <div className="max-w-full overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-zinc-600 sm:px-6">
                    Customer
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-zinc-600 sm:px-6">
                    Amount
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-zinc-600 sm:px-6">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 bg-white">
                {revenueRows.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-8 text-center text-sm text-zinc-600 sm:px-6">
                      No paid invoices in this date range.
                    </td>
                  </tr>
                ) : (
                  revenueRows.map((row) => (
                    <tr key={row.invoiceId} className="hover:bg-zinc-50">
                      <td className="px-3 py-4 text-sm font-medium text-zinc-900 sm:px-6">
                        {row.customerName}
                        <div className="mt-1 text-xs text-zinc-500">
                          {row.jobDescription}
                        </div>
                      </td>
                      <td className="px-3 py-4 text-sm text-zinc-700 sm:px-6">
                        {formatMoney(row.amountCents)}
                      </td>
                      <td className="px-3 py-4 text-sm text-zinc-600 sm:px-6">
                        {new Date(row.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

