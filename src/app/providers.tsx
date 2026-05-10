"use client";

import { TrialGate } from "@/components/TrialGate";

export function Providers({ children }: { children: React.ReactNode }) {
  return <TrialGate>{children}</TrialGate>;
}
