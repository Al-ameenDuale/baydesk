"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { ProfileRecord } from "@/lib/profileTypes";
import { ProfileModal } from "@/components/ProfileModal";
import { Sidebar } from "@/components/Sidebar";
import { UserAvatar } from "@/components/UserAvatar";

const NO_CHROME = new Set(["/", "/login", "/signup", "/terms", "/privacy", "/refund"]);

function chromeActive(pathname: string, hasSession: boolean) {
  if (!hasSession) return false;
  if (NO_CHROME.has(pathname)) return false;
  return true;
}

function showUpgradeLink(p: ProfileRecord | null) {
  if (!p) return true;
  return p.is_subscriber === false || p.subscription_status !== "active";
}

export function AppChrome({
  children,
  trialBannerVisible,
}: {
  children: React.ReactNode;
  trialBannerVisible: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<{
    userId: string;
    email: string | null;
  } | null>(null);
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, first_name, last_name, phone_number, shop_name, shop_address, profile_image_url, is_subscriber, subscription_status",
      )
      .eq("id", userId)
      .maybeSingle();

    if (!error && data) setProfile(data as ProfileRecord);
    else setProfile(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const {
        data: { session: s },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!s?.user?.id) {
        setSession(null);
        setProfile(null);
        return;
      }
      setSession({ userId: s.user.id, email: s.user.email ?? null });
      await loadProfile(s.user.id);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!s?.user?.id) {
        setSession(null);
        setProfile(null);
        return;
      }
      setSession({ userId: s.user.id, email: s.user.email ?? null });
      void loadProfile(s.user.id);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const active = chromeActive(pathname, !!session);

  useEffect(() => {
    setSidebarOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!sidebarOpen && !profileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen, profileOpen]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setSidebarOpen(false);
    router.replace("/login");
    window.location.href = "/login";
  }

  const headerTop = trialBannerVisible ? 52 : 0;

  return (
    <>
      {active && (
        <>
          <header
            className="fixed right-0 left-0 z-[45] flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 shadow-sm"
            style={{ top: headerTop }}
          >
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-[#1B2A4A] hover:underline"
            >
              BayDesk
            </Link>
            <div className="flex items-center gap-1">
              <UserAvatar
                profile={profile}
                email={session?.email}
                onClick={() => setSidebarOpen((v) => !v)}
              />
              <button
                type="button"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-zinc-700 hover:bg-zinc-100"
                aria-label={sidebarOpen ? "Close menu" : "Open menu"}
                aria-expanded={sidebarOpen}
                onClick={() => setSidebarOpen((v) => !v)}
              >
                <span className="sr-only">Menu</span>
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  {sidebarOpen ? (
                    <>
                      <path d="M6 6l12 12M18 6L6 18" />
                    </>
                  ) : (
                    <>
                      <path d="M4 7h16M4 12h16M4 17h16" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </header>
          <div className="h-14 shrink-0" aria-hidden />
        </>
      )}

      {active && (
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpenProfile={() => setProfileOpen(true)}
          profile={profile}
          email={session?.email ?? null}
          showUpgrade={showUpgradeLink(profile)}
          onLogout={handleLogout}
        />
      )}

      {active && session && (
        <ProfileModal
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          userId={session.userId}
          email={session.email}
          initial={profile}
          onSaved={(row) => {
            setProfile(row);
          }}
        />
      )}

      {children}
    </>
  );
}
