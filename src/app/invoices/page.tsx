"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type InvoiceStatus = "paid" | "unpaid";

type Invoice = {
  id: string;
  job_id: string;
  total_amount_cents: number;
  status: InvoiceStatus;
  created_at: string;
};

type Job = {
  id: string;
  description: string | null;
  customer_id: string;
};

type Customer = {
  id: string;
  name: string;
};

function formatMoney(cents: number) {
  const dollars = (cents / 100).toFixed(2);
  return `$${dollars}`;
}

export default function InvoicesPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [jobsById, setJobsById] = useState<Record<string, Job>>({});
  const [customersById, setCustomersById] = useState<Record<string, Customer>>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const jobIds = useMemo(() => invoices.map((i) => i.job_id), [invoices]);

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      setChecking(false);
    }

    checkSession();
  }, [router]);

  async function load() {
    setLoading(true);
    setError(null);

    const { data: inv, error: invErr } = await supabase
      .from("invoices")
      .select("id, job_id, total_amount_cents, status, created_at")
      .order("created_at", { ascending: false });

    if (invErr) {
      setLoading(false);
      setError(invErr.message);
      return;
    }

    const invList = (inv ?? []) as Invoice[];
    setInvoices(invList);

    if (invList.length === 0) {
      setJobsById({});
      setCustomersById({});
      setLoading(false);
      return;
    }

    const { data: jobs, error: jobsErr } = await supabase
      .from("jobs")
      .select("id, description, customer_id")
      .in("id", invList.map((i) => i.job_id));

    if (jobsErr) {
      setLoading(false);
      setError(jobsErr.message);
      return;
    }

    const jobsMap: Record<string, Job> = {};
    const customerIds: string[] = [];
    for (const j of (jobs ?? []) as Job[]) {
      jobsMap[j.id] = j;
      customerIds.push(j.customer_id);
    }
    setJobsById(jobsMap);

    const uniqueCustomerIds = Array.from(new Set(customerIds));
    const { data: custs, error: custErr } = await supabase
      .from("customers")
      .select("id, name")
      .in("id", uniqueCustomerIds);

    setLoading(false);

    if (custErr) {
      setError(custErr.message);
      return;
    }

    const custMap: Record<string, Customer> = {};
    for (const c of (custs ?? []) as Customer[]) custMap[c.id] = c;
    setCustomersById(custMap);
  }

  useEffect(() => {
    if (!checking) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checking]);

  async function updateStatus(invoiceId: string, status: InvoiceStatus) {
    setInvoices((prev) => prev.map((i) => (i.id === invoiceId ? { ...i, status } : i)));
    const { error: updErr } = await supabase
      .from("invoices")
      .update({ status })
      .eq("id", invoiceId);
    if (updErr) {
      await load();
      alert(`Could not update invoice: ${updErr.message}`);
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <p className="text-sm text-zinc-600">Loading invoices...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-0 bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
            <a href="/dashboard" className="text-sm font-medium text-zinc-700 hover:underline">
              Dashboard
            </a>
            <span className="text-zinc-300">/</span>
            <h1 className="text-lg font-semibold text-zinc-900">Invoices</h1>
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <a
              href="/jobs"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-zinc-300 px-3 text-xs font-medium text-zinc-800 hover:bg-zinc-100"
            >
              Generate from jobs
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 md:py-8">
        <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-zinc-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <h2 className="text-base font-semibold text-zinc-900">All invoices</h2>
            <button
              onClick={() => void load()}
              disabled={loading}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-100 disabled:opacity-60"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {error && (
            <div className="px-4 py-4 sm:px-6">
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            </div>
          )}

          <div className="max-w-full overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-600">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-600">
                    Job
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-600">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-600">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-600">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 bg-white">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-zinc-600">
                      No invoices yet. Mark a job as Done and generate one from `/jobs`.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => {
                    const job = jobsById[inv.job_id];
                    const customer = job ? customersById[job.customer_id] : undefined;
                    return (
                      <tr key={inv.id} className="hover:bg-zinc-50">
                        <td className="px-6 py-4 text-sm font-medium text-zinc-900">
                          {customer?.name ?? "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-700">
                          <a className="underline" href={`/invoices/${inv.id}`}>
                            {job?.description ?? "—"}
                          </a>
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-700">
                          {formatMoney(inv.total_amount_cents)}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={inv.status}
                            onChange={(e) =>
                              void updateStatus(inv.id, e.target.value as InvoiceStatus)
                            }
                            className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                          >
                            <option value="unpaid">Unpaid</option>
                            <option value="paid">Paid</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-600">
                          {new Date(inv.created_at).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

