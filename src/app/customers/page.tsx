"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
};

export default function CustomersPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [jobCounts, setJobCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showNew, setShowNew] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const canCreate = useMemo(() => {
    return name.trim().length > 0 && !creating;
  }, [name, creating]);

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

  async function loadCustomersAndCounts() {
    setLoading(true);
    setError(null);

    const { data: custs, error: custErr } = await supabase
      .from("customers")
      .select("id, name, email, phone, created_at")
      .order("created_at", { ascending: false });

    if (custErr) {
      setLoading(false);
      setError(custErr.message);
      return;
    }

    const list = (custs ?? []) as Customer[];
    setCustomers(list);

    // Job counts (simple, avoids ambiguous relationship embeds)
    const { data: jobs, error: jobsErr } = await supabase
      .from("jobs")
      .select("customer_id");

    setLoading(false);

    if (jobsErr) {
      setError(jobsErr.message);
      return;
    }

    const counts: Record<string, number> = {};
    for (const row of (jobs ?? []) as Array<{ customer_id: string }>) {
      counts[row.customer_id] = (counts[row.customer_id] ?? 0) + 1;
    }
    setJobCounts(counts);
  }

  useEffect(() => {
    if (!checking) void loadCustomersAndCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checking]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!userId) return;

    setCreating(true);
    setCreateError(null);

    const { error: insertError } = await supabase.from("customers").insert({
      owner_id: userId,
      name: name.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
    });

    setCreating(false);

    if (insertError) {
      setCreateError(insertError.message);
      return;
    }

    setName("");
    setEmail("");
    setPhone("");
    setShowNew(false);

    await loadCustomersAndCounts();
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <p className="text-sm text-zinc-600">Loading customers...</p>
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
            <h1 className="text-lg font-semibold text-zinc-900">Customers</h1>
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <button
              onClick={() => setShowNew(true)}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              New customer
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 md:py-8">
        {showNew && (
          <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-semibold text-zinc-900">Create customer</h2>
              <button
                onClick={() => {
                  if (!creating) setShowNew(false);
                }}
                className="text-sm text-zinc-600 hover:text-zinc-900"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-800">Name</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-800">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  placeholder="jane@example.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-800">
                  Phone number
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  placeholder="(555) 123-4567"
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
                  disabled={!canCreate}
                  className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
                >
                  {creating ? "Creating..." : "Create customer"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNew(false)}
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
            <h2 className="text-base font-semibold text-zinc-900">All customers</h2>
            <button
              onClick={() => void loadCustomersAndCounts()}
              disabled={loading}
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-zinc-300 px-3 text-xs font-medium text-zinc-800 hover:bg-zinc-100 disabled:opacity-60"
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
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-600">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-600">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-600">
                    Jobs
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 bg-white">
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-zinc-600">
                      No customers yet. Click “New customer” to create one.
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c.id} className="hover:bg-zinc-50">
                      <td className="px-6 py-4 text-sm font-medium text-zinc-900">
                        <a className="underline" href={`/customers/${c.id}`}>
                          {c.name}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-700">{c.email ?? "—"}</td>
                      <td className="px-6 py-4 text-sm text-zinc-700">{c.phone ?? "—"}</td>
                      <td className="px-6 py-4 text-sm text-zinc-700">
                        {jobCounts[c.id] ?? 0}
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

