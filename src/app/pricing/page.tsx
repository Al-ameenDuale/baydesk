"use client";

import { useEffect, useMemo, useState } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/lib/supabase/client";

export default function PricingPage() {
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [isSubscriber, setIsSubscriber] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trialActive = useMemo(() => {
    if (!trialEndsAt) return false;
    return new Date(trialEndsAt).getTime() > new Date().getTime();
  }, [trialEndsAt]);

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.replace("/login");
        return;
      }

      setEmail(session.user.email ?? null);
      setUserId(session.user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_subscriber, subscription_status, trial_ends_at")
        .eq("id", session.user.id)
        .single();

      setIsSubscriber(
        profile?.is_subscriber === true &&
          profile?.subscription_status === "active",
      );
      setTrialEndsAt(profile?.trial_ends_at ?? null);
      setChecking(false);
    }

    checkSession();
  }, []);

  async function startFreeTrial() {
    if (!userId) return;
    setError(null);
    setLoading(true);

    const ends = new Date(
      Date.now() + 14 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const { error: updErr } = await supabase
      .from("profiles")
      .update({
        is_subscriber: false,
        subscription_status: "trialing",
        trial_ends_at: ends,
      })
      .eq("id", userId);

    setLoading(false);

    if (updErr) {
      setError(updErr.message);
      return;
    }

    setTrialEndsAt(ends);
    window.location.replace("/dashboard");
  }

  async function getAccessToken(): Promise<string | null> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) return session.access_token;
    const { data } = await supabase.auth.refreshSession();
    return data.session?.access_token ?? null;
  }

  async function subscribeDodo() {
    if (!userId || !email) return;
    setError(null);
    setLoading(true);

    const accessToken = await getAccessToken();
    if (!accessToken) {
      setLoading(false);
      setError("You must be signed in to subscribe.");
      return;
    }

    const res = await fetch("/api/dodo/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const json = (await res.json().catch(() => null)) as
      | { url?: string; error?: string }
      | null;

    setLoading(false);

    if (!res.ok || !json?.url) {
      setError(json?.error || "Could not start checkout.");
      return;
    }

    window.location.href = json.url;
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <p className="text-sm text-zinc-600">Loading pricing...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <a
            href="/dashboard"
            className="text-sm font-medium text-zinc-700 hover:underline"
          >
            Dashboard
          </a>
          <span className="text-zinc-300">/</span>
          <h1 className="text-lg font-semibold text-zinc-900">Pricing</h1>
        </div>
        <div className="text-sm text-zinc-600">
          {email ? `Signed in as ${email}` : ""}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
        <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-zinc-900">Entry tier</h2>
          <p className="mt-1 text-sm text-zinc-600">
            $49.99/month. Includes a 14‑day free trial with no card required.
          </p>

          <div className="mt-6 flex items-baseline justify-between">
            <div>
              <div className="text-3xl font-semibold text-zinc-900">
                $49.99
              </div>
              <div className="text-sm text-zinc-600">per month</div>
            </div>
            <div className="text-sm text-zinc-600">14‑day trial</div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              onClick={() => void startFreeTrial()}
              disabled={loading || trialActive || isSubscriber}
              className="h-10 w-full rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
            >
              {isSubscriber
                ? "You\u2019re subscribed"
                : trialActive
                  ? "Trial active"
                  : loading
                    ? "Starting..."
                    : "Start 14\u2011day free trial"}
            </button>
            <button
              onClick={() => void subscribeDodo()}
              disabled={loading || isSubscriber}
              className="h-10 w-full rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
            >
              {loading ? "Redirecting..." : "Subscribe with Dodo"}
            </button>
          </div>

          {/* Paddle checkout integration coming soon. */}
          <p className="mt-4 rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-4 py-3 text-center text-sm text-zinc-600">
            Paddle checkout integration coming soon.
          </p>

          {trialEndsAt && !isSubscriber && (
            <p className="mt-3 text-xs text-zinc-500">
              Trial ends: {new Date(trialEndsAt).toLocaleString()}
            </p>
          )}

          {error && (
            <p className="mt-4 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-6 text-sm text-zinc-700 shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-900">Notes</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Trial is enforced in-app (no card required).</li>
            <li>
              Paid subscription activation happens via Dodo Payments webhook after
              checkout.
            </li>
            <li>Paddle checkout will be available here when integration is complete.</li>
          </ul>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
