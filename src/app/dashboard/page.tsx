"use client";

import { useEffect, useState } from "react";
import { UpgradeToProNavLink, type SubscriptionNavFields } from "@/components/UpgradeToProNavLink";
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

export default function DashboardPage() {
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [navSubscription, setNavSubscription] = useState<SubscriptionNavFields>({
    is_subscriber: null,
    subscription_status: null,
  });

  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [totalRevenueCents, setTotalRevenueCents] = useState(0);
  const [outstandingCents, setOutstandingCents] = useState(0);
  const [jobsThisMonth, setJobsThisMonth] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);

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

      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("is_subscriber, subscription_status, created_at")
        .eq("id", session.user.id)
        .single();

      const subscriptionSnapshot: SubscriptionNavFields =
        !profileErr && profile
          ? {
              is_subscriber: profile.is_subscriber ?? null,
              subscription_status: profile.subscription_status ?? null,
            }
          : { is_subscriber: null, subscription_status: null };

      setNavSubscription(subscriptionSnapshot);

      const status = profile?.subscription_status ?? null;
      const createdAt =
        (profile?.created_at as string | undefined) ?? session.user.created_at ?? null;
      const allowed =
        subscriptionIsActive(status) || hasFreeTrialAccess(createdAt, status);
      if (!allowed) {
        window.location.replace("/trial-expired");
        return;
      }

      setEmail(session.user.email ?? null);
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
    for (const row of (invoices ?? []) as Array<{
      status: InvoiceStatus;
      total_amount_cents: number;
    }>) {
      if (row.status === "paid") paid += row.total_amount_cents;
      else unpaid += row.total_amount_cents;
    }
    setTotalRevenueCents(paid);
    setOutstandingCents(unpaid);

    const monthStartIso = new Date(
      today.getFullYear(),
      today.getMonth(),
      1,
      0,
      0,
      0,
      0
    ).toISOString();

    const { data: jobs, error: jobsErr } = await supabase
      .from("jobs")
      .select("id, created_at")
      .gte("created_at", monthStartIso);

    if (jobsErr) {
      setLoadingSummary(false);
      setSummaryError(jobsErr.message);
      return;
    }
    setJobsThisMonth((jobs ?? []).length);

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

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.replace("/login");
  }

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
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="min-w-0 text-lg font-semibold text-zinc-900">BayDesk Dashboard</h1>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <a
              href="/jobs"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-zinc-300 px-3 text-xs font-medium text-zinc-800 hover:bg-zinc-100"
            >
              Jobs
            </a>
            <a
              href="/customers"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-zinc-300 px-3 text-xs font-medium text-zinc-800 hover:bg-zinc-100"
            >
              Customers
            </a>
            <a
              href="/invoices"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-zinc-300 px-3 text-xs font-medium text-zinc-800 hover:bg-zinc-100"
            >
              Invoices
            </a>
            <UpgradeToProNavLink profile={navSubscription} />
            {email && (
              <span className="max-w-full truncate text-sm text-zinc-600 sm:max-w-[14rem]">
                Signed in as {email}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-zinc-300 px-3 text-xs font-medium text-zinc-800 hover:bg-zinc-100"
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 md:py-8">
        {summaryError && (
          <section className="rounded-lg border border-red-200 bg-white p-4 text-sm text-red-700">
            {summaryError}
          </section>
        )}

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

