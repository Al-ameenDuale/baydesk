"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { subscriptionIsActive, trialDaysRemaining, trialHasExpired } from "@/lib/trial";
import { supabase } from "@/lib/supabase/client";

const PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/signup",
  "/pricing",
  "/trial-expired",
]);

function isProtectedPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return false;
  const protectedPrefixes = ["/dashboard", "/jobs", "/customers", "/invoices"];
  return protectedPrefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function TrialGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [bannerDaysLeft, setBannerDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (!session) {
        setBannerDaysLeft(null);
        if (isProtectedPath(pathname)) {
          router.replace("/login");
          return;
        }
        setReady(true);
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

      if (subscriptionIsActive(status)) {
        setBannerDaysLeft(null);
        if (pathname === "/trial-expired") {
          router.replace("/dashboard");
          return;
        }
        setReady(true);
        return;
      }

      const expired = trialHasExpired(createdAt);

      if (expired) {
        setBannerDaysLeft(null);
        if (pathname === "/trial-expired") {
          setReady(true);
          return;
        }
        if (isProtectedPath(pathname)) {
          router.replace("/trial-expired");
          return;
        }
        setReady(true);
        return;
      }

      if (createdAt) {
        setBannerDaysLeft(trialDaysRemaining(createdAt));
        if (pathname === "/trial-expired") {
          router.replace("/dashboard");
          return;
        }
      } else {
        setBannerDaysLeft(null);
      }

      setReady(true);
    }

    setReady(false);
    void run();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void run();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-sm text-zinc-600">Loading…</p>
      </div>
    );
  }

  const showBanner = bannerDaysLeft !== null && bannerDaysLeft > 0;

  return (
    <>
      {showBanner && (
        <div className="sticky top-0 z-50 border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-950">
          You&apos;re on a free trial — {bannerDaysLeft}{" "}
          {bannerDaysLeft === 1 ? "day" : "days"} remaining. Upgrade to keep access.{" "}
          <Link href="/pricing" className="font-semibold underline hover:no-underline">
            Upgrade
          </Link>
        </div>
      )}
      {children}
    </>
  );
}
