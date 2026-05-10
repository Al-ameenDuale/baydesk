"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export type SubscriptionNavFields = {
  is_subscriber: boolean | null;
  subscription_status: string | null;
};

function shouldShowUpgrade(p: SubscriptionNavFields): boolean {
  return p.is_subscriber === false || p.subscription_status !== "active";
}

/** Pass `profile` when already loaded to avoid an extra query. */
export function UpgradeToProNavLink({ profile }: { profile?: SubscriptionNavFields }) {
  const [fetchedProfile, setFetchedProfile] = useState<SubscriptionNavFields | null>(null);

  useEffect(() => {
    if (profile !== undefined) return;

    let cancelled = false;

    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled || !session?.user?.id) return;

      const { data } = await supabase
        .from("profiles")
        .select("is_subscriber, subscription_status")
        .eq("id", session.user.id)
        .single();

      if (cancelled) return;
      setFetchedProfile({
        is_subscriber: data?.is_subscriber ?? null,
        subscription_status: data?.subscription_status ?? null,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [profile]);

  const effective = profile !== undefined ? profile : fetchedProfile;
  if (!effective) return null;
  if (!shouldShowUpgrade(effective)) return null;

  return (
    <Link
      href="/pricing"
      className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800"
    >
      Upgrade to Pro
    </Link>
  );
}

