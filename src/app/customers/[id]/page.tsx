"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type JobStatus = "pending" | "in_progress" | "done";

type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
};

type JobRow = {
  id: string;
  description: string | null;
  status: JobStatus;
  created_at: string;
  // Supabase join returns an array (even for FK joins) in this setup.
  cars: Array<{ make: string | null; model: string | null; year: number | null }> | null;
};

function formatCar(car: JobRow["cars"]) {
  const first = Array.isArray(car) ? (car[0] ?? null) : null;
  if (!first) return "—";
  const parts = [first.year ?? null, first.make ?? null, first.model ?? null].filter(
    (p) => p !== null && String(p).trim().length > 0,
  );
  return parts.length ? parts.join(" ") : "—";
}

export default function CustomerProfilePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const customerId = params.id;

  const [checking, setChecking] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    async function load() {
      setError(null);

      const { data: cust, error: custErr } = await supabase
        .from("customers")
        .select("id, name, email, phone, created_at")
        .eq("id", customerId)
        .single();

      if (custErr) {
        setError(custErr.message);
        return;
      }

      setCustomer(cust as Customer);

      const { data: jobsData, error: jobsErr } = await supabase
        .from("jobs")
        .select("id, description, status, created_at, cars!jobs_car_id_fkey(make, model, year)")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });

      if (jobsErr) {
        setError(jobsErr.message);
        return;
      }

      setJobs((jobsData ?? []) as unknown as JobRow[]);
    }

    if (!checking) void load();
  }, [checking, customerId]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <p className="text-sm text-zinc-600">Loading customer...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-0 bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
            <Link href="/customers" className="text-sm font-medium text-zinc-700 hover:underline">
              Customers
            </Link>
            <span className="text-zinc-300">/</span>
            <h1 className="min-w-0 truncate text-lg font-semibold text-zinc-900">
              {customer?.name ?? "Customer"}
            </h1>
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <a
              href="/jobs"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-zinc-300 px-3 text-xs font-medium text-zinc-800 hover:bg-zinc-100"
            >
              View jobs
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 md:py-8">
        {error && (
          <section className="rounded-lg border border-red-200 bg-white p-4 text-sm text-red-700">
            {error}
          </section>
        )}

        {customer && (
          <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-zinc-900">Customer details</h2>
            <dl className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <dt className="text-xs font-semibold text-zinc-500">Name</dt>
                <dd className="text-sm text-zinc-900">{customer.name}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-zinc-500">Email</dt>
                <dd className="text-sm text-zinc-900">{customer.email ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-zinc-500">Phone</dt>
                <dd className="text-sm text-zinc-900">{customer.phone ?? "—"}</dd>
              </div>
            </dl>
          </section>
        )}

        <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 px-6 py-4">
            <h2 className="text-base font-semibold text-zinc-900">Jobs</h2>
          </div>
          <div className="max-w-full overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-600">
                    Car
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-600">
                    Description
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
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-zinc-600">
                      No jobs for this customer yet.
                    </td>
                  </tr>
                ) : (
                  jobs.map((j) => (
                    <tr key={j.id} className="hover:bg-zinc-50">
                      <td className="px-6 py-4 text-sm text-zinc-700">{formatCar(j.cars)}</td>
                      <td className="px-6 py-4 text-sm text-zinc-700">{j.description ?? "—"}</td>
                      <td className="px-6 py-4 text-sm text-zinc-700">
                        {j.status === "pending"
                          ? "Pending"
                          : j.status === "in_progress"
                            ? "In Progress"
                            : "Done"}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-600">
                        {new Date(j.created_at).toLocaleString()}
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

