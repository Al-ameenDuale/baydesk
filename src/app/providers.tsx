"use client";

import { TrialGate } from "@/components/TrialGate";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <TrialGate>{children}</TrialGate>
    </div>
  );
}
