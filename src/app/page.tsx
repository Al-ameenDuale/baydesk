"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export default function Home() {
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (session) {
        window.location.replace("/dashboard");
        return;
      }

      window.location.replace("/login");
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <p className="text-sm text-zinc-600">Loading…</p>
    </div>
  );
}
