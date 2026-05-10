"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { UpgradeToProNavLink } from "@/components/UpgradeToProNavLink";
import { supabase } from "@/lib/supabase/client";

type InvoiceStatus = "paid" | "unpaid";

type Invoice = {
  id: string;
  job_id: string;
  total_amount_cents: number;
  status: InvoiceStatus;
  notes: string | null;
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
  email: string | null;
  phone: string | null;
};

type Profile = {
  id: string;
  shop_name: string | null;
};

function formatMoney(cents: number) {
  const dollars = (cents / 100).toFixed(2);
  return `$${dollars}`;
}

export default function InvoicePrintPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const invoiceId = params.id;

  const [checking, setChecking] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const shopName = useMemo(() => {
    return profile?.shop_name?.trim() ? profile.shop_name.trim() : "GarageOS";
  }, [profile]);

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

  async function load() {
    setError(null);

    const { data: inv, error: invErr } = await supabase
      .from("invoices")
      .select("id, job_id, total_amount_cents, status, notes, created_at")
      .eq("id", invoiceId)
      .single();

    if (invErr) {
      setError(invErr.message);
      return;
    }

    setInvoice(inv as Invoice);

    const { data: prof, error: profErr } = await supabase
      .from("profiles")
      .select("id, shop_name")
      .eq("id", (userId ?? "") as string)
      .single();

    if (!profErr) setProfile(prof as Profile);

    const { data: j, error: jobErr } = await supabase
      .from("jobs")
      .select("id, description, customer_id")
      .eq("id", (inv as Invoice).job_id)
      .single();

    if (jobErr) {
      setError(jobErr.message);
      return;
    }

    setJob(j as Job);

    const { data: c, error: custErr } = await supabase
      .from("customers")
      .select("id, name, email, phone")
      .eq("id", (j as Job).customer_id)
      .single();

    if (custErr) {
      setError(custErr.message);
      return;
    }

    setCustomer(c as Customer);
  }

  useEffect(() => {
    if (!checking && userId) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checking, userId, invoiceId]);

  async function setStatus(status: InvoiceStatus) {
    if (!invoice) return;
    setUpdating(true);
    setInvoice({ ...invoice, status });

    const { error: updErr } = await supabase
      .from("invoices")
      .update({ status })
      .eq("id", invoice.id);

    setUpdating(false);

    if (updErr) {
      await load();
      alert(`Could not update invoice: ${updErr.message}`);
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <p className="text-sm text-zinc-600">Loading invoice...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 p-6">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <a
              href="/invoices"
              className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
            >
              Back to invoices
            </a>
            <button
              onClick={() => window.print()}
              className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800"
            >
              Print
            </button>
            <UpgradeToProNavLink />
          </div>
          {invoice && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-600">Status</span>
              <select
                value={invoice.status}
                onChange={(e) => void setStatus(e.target.value as InvoiceStatus)}
                disabled={updating}
                className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 disabled:opacity-60"
              >
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-8 shadow-sm print:border-0 print:shadow-none">
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 print:hidden">
              {error}
            </div>
          )}

          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-2xl font-semibold text-zinc-900">Invoice</h1>
              <p className="mt-1 text-sm text-zinc-600">{shopName}</p>
            </div>
            {invoice && (
              <div className="text-right">
                <p className="text-sm text-zinc-600">Invoice ID</p>
                <p className="font-mono text-xs text-zinc-900">{invoice.id}</p>
                <p className="mt-2 text-sm text-zinc-600">Created</p>
                <p className="text-sm text-zinc-900">
                  {new Date(invoice.created_at).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          <hr className="my-6 border-zinc-200" />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">Bill to</h2>
              <div className="mt-2 text-sm text-zinc-700">
                <p className="font-medium text-zinc-900">{customer?.name ?? "—"}</p>
                <p>{customer?.email ?? ""}</p>
                <p>{customer?.phone ?? ""}</p>
              </div>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">Payment status</h2>
              <p className="mt-2 text-sm text-zinc-700">
                {invoice?.status === "paid" ? "Paid" : "Unpaid"}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-sm font-semibold text-zinc-900">Job</h2>
            <p className="mt-2 text-sm text-zinc-700 whitespace-pre-wrap">
              {job?.description ?? "—"}
            </p>
          </div>

          {invoice?.notes && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-zinc-900">Notes</h2>
              <p className="mt-2 text-sm text-zinc-700 whitespace-pre-wrap">
                {invoice.notes}
              </p>
            </div>
          )}

          <div className="mt-10 flex items-center justify-end">
            <div className="w-full max-w-xs">
              <div className="flex items-center justify-between border-t border-zinc-200 pt-4">
                <span className="text-sm font-semibold text-zinc-900">Total</span>
                <span className="text-sm font-semibold text-zinc-900">
                  {invoice ? formatMoney(invoice.total_amount_cents) : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

