"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UpgradeToProNavLink } from "@/components/UpgradeToProNavLink";
import { supabase } from "@/lib/supabase/client";

type JobStatus = "pending" | "in_progress" | "done";

type CustomerOption = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
};

type JobRow = {
  id: string;
  description: string | null;
  status: JobStatus;
  created_at: string;
  customers: { name: string } | null;
  cars: { make: string | null; model: string | null; year: number | null } | null;
};

const STATUS_OPTIONS: Array<{ value: JobStatus; label: string }> = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

function formatCar(car: JobRow["cars"]) {
  if (!car) return "—";
  const parts = [car.year ?? null, car.make ?? null, car.model ?? null].filter(
    (p) => p !== null && String(p).trim().length > 0
  );
  return parts.length ? parts.join(" ") : "—";
}

export default function JobsPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobsError, setJobsError] = useState<string | null>(null);

  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [customersError, setCustomersError] = useState<string | null>(null);

  const [showNewJob, setShowNewJob] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [showInvoiceForJobId, setShowInvoiceForJobId] = useState<string | null>(
    null
  );
  const [invoiceTotal, setInvoiceTotal] = useState<string>("");
  const [invoiceNotes, setInvoiceNotes] = useState<string>("");
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);

  const [customerId, setCustomerId] = useState<string>("");
  const [carMake, setCarMake] = useState("");
  const [carModel, setCarModel] = useState("");
  const [carYear, setCarYear] = useState<string>("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobStatus, setJobStatus] = useState<JobStatus>("pending");

  const canSubmit = useMemo(() => {
    return (
      customerId.trim().length > 0 &&
      jobDescription.trim().length > 0 &&
      !creating
    );
  }, [customerId, jobDescription, creating]);

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      setUserId(session.user.id);
      setChecking(false);
    }

    checkSession();
  }, [router]);

  async function loadCustomers() {
    setLoadingCustomers(true);
    setCustomersError(null);

    const { data, error } = await supabase
      .from("customers")
      .select("id, name, email, phone")
      .order("created_at", { ascending: false });

    setLoadingCustomers(false);

    if (error) {
      setCustomersError(error.message);
      return;
    }

    setCustomers((data ?? []) as CustomerOption[]);
  }

  async function loadJobs() {
    setLoadingJobs(true);
    setJobsError(null);

    const { data, error } = await supabase
      .from("jobs")
      .select(
        "id, description, status, created_at, customers!jobs_customer_id_fkey(name), cars!jobs_car_id_fkey(make, model, year)"
      )
      .order("created_at", { ascending: false });

    setLoadingJobs(false);

    if (error) {
      setJobsError(error.message);
      return;
    }

    const rows: JobRow[] = (data ?? []).map((row: any) => {
      const customer =
        Array.isArray(row?.customers) ? (row.customers[0] ?? null) : (row?.customers ?? null);
      const car = Array.isArray(row?.cars) ? (row.cars[0] ?? null) : (row?.cars ?? null);

      return {
        id: String(row?.id ?? ""),
        description: row?.description ?? null,
        status: row?.status as JobStatus,
        created_at: String(row?.created_at ?? ""),
        customers: customer,
        cars: car,
      };
    });

    setJobs(rows);
  }

  useEffect(() => {
    if (!checking) {
      void loadCustomers();
      void loadJobs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checking]);

  async function handleCreateJob(e: FormEvent) {
    e.preventDefault();
    if (!userId) return;

    setCreateError(null);
    setCreating(true);

    const trimmedDescription = jobDescription.trim();

    const year =
      carYear.trim().length > 0 && !Number.isNaN(Number(carYear))
        ? Number(carYear)
        : null;

    const { data: car, error: carError } = await supabase
      .from("cars")
      .insert({
        owner_id: userId,
        customer_id: customerId,
        make: carMake.trim() || null,
        model: carModel.trim() || null,
        year,
        license_plate: null,
      })
      .select("id")
      .single();

    if (carError) {
      setCreating(false);
      setCreateError(carError.message);
      return;
    }

    const { error: jobError } = await supabase.from("jobs").insert({
      owner_id: userId,
      customer_id: customerId,
      car_id: car.id,
      status: jobStatus,
      description: trimmedDescription,
    });

    setCreating(false);

    if (jobError) {
      setCreateError(jobError.message);
      return;
    }

    setCustomerId("");
    setCarMake("");
    setCarModel("");
    setCarYear("");
    setJobDescription("");
    setJobStatus("pending");
    setShowNewJob(false);

    await loadCustomers();
    await loadJobs();
  }

  async function handleUpdateStatus(jobId: string, status: JobStatus) {
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status } : j)));

    const { error } = await supabase.from("jobs").update({ status }).eq("id", jobId);
    if (error) {
      // revert via reload to ensure UI matches server
      await loadJobs();
      alert(`Could not update status: ${error.message}`);
    }
  }

  async function openInvoice(jobId: string) {
    setInvoiceError(null);
    setInvoiceNotes("");
    setInvoiceTotal("");

    // If invoice already exists, go straight to it
    const { data, error } = await supabase
      .from("invoices")
      .select("id")
      .eq("job_id", jobId)
      .limit(1);

    if (!error && data && data.length > 0) {
      router.push(`/invoices/${data[0].id}`);
      return;
    }

    setShowInvoiceForJobId(jobId);
  }

  async function handleCreateInvoice(e: FormEvent) {
    e.preventDefault();
    if (!userId || !showInvoiceForJobId) return;

    setInvoiceError(null);
    setCreatingInvoice(true);

    const amount = Number(invoiceTotal);
    if (!Number.isFinite(amount) || amount < 0) {
      setCreatingInvoice(false);
      setInvoiceError("Enter a valid total amount (e.g. 149.99).");
      return;
    }

    const total_amount_cents = Math.round(amount * 100);

    const { data, error } = await supabase
      .from("invoices")
      .insert({
        owner_id: userId,
        job_id: showInvoiceForJobId,
        total_amount_cents,
        status: "unpaid",
        notes: invoiceNotes.trim() || null,
      })
      .select("id")
      .single();

    setCreatingInvoice(false);

    if (error) {
      setInvoiceError(error.message);
      return;
    }

    setShowInvoiceForJobId(null);
    setInvoiceTotal("");
    setInvoiceNotes("");

    router.push(`/invoices/${data.id}`);
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <p className="text-sm text-zinc-600">Loading jobs...</p>
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
            <h1 className="text-lg font-semibold text-zinc-900">Jobs</h1>
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <UpgradeToProNavLink />
            <button
              onClick={() => setShowNewJob(true)}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              New job
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 md:py-8">
        {showInvoiceForJobId && (
          <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-semibold text-zinc-900">
                Generate invoice
              </h2>
              <button
                onClick={() => {
                  if (!creatingInvoice) setShowInvoiceForJobId(null);
                }}
                className="text-sm text-zinc-600 hover:text-zinc-900"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-800">
                  Total amount
                </label>
                <input
                  value={invoiceTotal}
                  onChange={(e) => setInvoiceTotal(e.target.value)}
                  inputMode="decimal"
                  required
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  placeholder="149.99"
                />
                <p className="mt-1 text-xs text-zinc-500">USD (stored in cents).</p>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-zinc-800">
                  Additional notes
                </label>
                <textarea
                  value={invoiceNotes}
                  onChange={(e) => setInvoiceNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  placeholder="Parts and labor breakdown, payment instructions, etc."
                />
              </div>

              {invoiceError && (
                <p className="md:col-span-2 text-sm text-red-600" role="alert">
                  {invoiceError}
                </p>
              )}

              <div className="md:col-span-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={creatingInvoice}
                  className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
                >
                  {creatingInvoice ? "Generating..." : "Generate invoice"}
                </button>
                <a
                  href="/invoices"
                  className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
                >
                  View invoices
                </a>
              </div>
            </form>
          </section>
        )}

        {showNewJob && (
          <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-semibold text-zinc-900">Create job</h2>
              <button
                onClick={() => {
                  if (!creating) setShowNewJob(false);
                }}
                className="text-sm text-zinc-600 hover:text-zinc-900"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleCreateJob} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-800">
                  Customer
                </label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  required
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                >
                  <option value="">
                    {loadingCustomers ? "Loading customers..." : "Select a customer"}
                  </option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {customersError && (
                  <p className="mt-1 text-xs text-red-600" role="alert">
                    {customersError}
                  </p>
                )}
                <p className="mt-1 text-xs text-zinc-500">
                  Need to add someone new?{" "}
                  <a className="underline" href="/customers">
                    Create a customer
                  </a>
                  .
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-800">
                  Status
                </label>
                <select
                  value={jobStatus}
                  onChange={(e) => setJobStatus(e.target.value as JobStatus)}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-800">
                  Car make
                </label>
                <input
                  value={carMake}
                  onChange={(e) => setCarMake(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  placeholder="Honda"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-800">
                  Car model
                </label>
                <input
                  value={carModel}
                  onChange={(e) => setCarModel(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  placeholder="Civic"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-800">
                  Car year
                </label>
                <input
                  value={carYear}
                  onChange={(e) => setCarYear(e.target.value)}
                  inputMode="numeric"
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  placeholder="2016"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-zinc-800">
                  Job description
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  required
                  rows={3}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  placeholder="Oil change and inspect brakes"
                />
              </div>

              {createError && (
                <p className="md:col-span-2 text-sm text-red-600" role="alert">
                  {createError}
                </p>
              )}

              <div className="md:col-span-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
                >
                  {creating ? "Creating..." : "Create job"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewJob(false)}
                  disabled={creating}
                  className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-zinc-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <h2 className="text-base font-semibold text-zinc-900">All jobs</h2>
            <button
              onClick={() => void loadJobs()}
              disabled={loadingJobs}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-100 disabled:opacity-60"
            >
              {loadingJobs ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {jobsError && (
            <div className="px-4 py-4 sm:px-6">
              <p className="text-sm text-red-600" role="alert">
                {jobsError}
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
                  <th className="px-6 py-3 text-right text-xs font-semibold text-zinc-600">
                    Invoice
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 bg-white">
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-zinc-600">
                      No jobs yet. Click “New job” to create one.
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-zinc-50">
                      <td className="px-6 py-4 text-sm text-zinc-900">
                        {job.customers?.name ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-700">
                        {formatCar(job.cars)}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-700">
                        {job.description ?? "—"}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={job.status}
                          onChange={(e) =>
                            void handleUpdateStatus(job.id, e.target.value as JobStatus)
                          }
                          className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-600">
                        {new Date(job.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {job.status === "done" ? (
                          <button
                            onClick={() => void openInvoice(job.id)}
                            className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-100"
                          >
                            Generate
                          </button>
                        ) : (
                          <span className="text-xs text-zinc-500">—</span>
                        )}
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

