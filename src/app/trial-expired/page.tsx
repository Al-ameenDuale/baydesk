"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { hasFreeTrialAccess, subscriptionIsActive } from "@/lib/trial";
import { supabase } from "@/lib/supabase/client";

export default function TrialExpiredPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (!session) {
        router.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_status, created_at")
        .eq("id", session.user.id)
        .single();

      if (cancelled) return;

      const status = profile?.subscription_status ?? null;
      const createdAt =
        (profile?.created_at as string | undefined) ?? session.user.created_at ?? null;

      if (subscriptionIsActive(status) || hasFreeTrialAccess(createdAt, status)) {
        router.replace("/dashboard");
        return;
      }

      setChecking(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen min-w-0 items-center justify-center bg-zinc-50">
        <p className="text-sm text-zinc-600">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen min-w-0 items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md min-w-0 rounded-lg border border-zinc-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <h1 className="text-xl font-semibold text-zinc-900">Free trial ended</h1>
        <p className="mt-4 text-sm text-zinc-600">
          Your free trial has expired. Upgrade to continue using BayDesk.
        </p>
        <Link
          href="/pricing"
          className="mx-auto mt-6 inline-flex min-h-12 w-full max-w-xs items-center justify-center rounded-md bg-zinc-900 px-6 text-sm font-medium text-white hover:bg-zinc-800 sm:w-auto"
        >
          Upgrade
        </Link>
      </div>
    </div>
  );
}
