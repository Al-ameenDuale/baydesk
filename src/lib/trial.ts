export const TRIAL_DAYS = 14;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function subscriptionIsActive(status: string | null | undefined): boolean {
  return status === "active";
}

export function trialEndTimestamp(createdAtIso: string): number {
  return new Date(createdAtIso).getTime() + TRIAL_DAYS * MS_PER_DAY;
}

/** Whole days left in the free trial (0 when expired or same-day end). */
export function trialDaysRemaining(createdAtIso: string, now = Date.now()): number {
  const end = trialEndTimestamp(createdAtIso);
  return Math.max(0, Math.ceil((end - now) / MS_PER_DAY));
}

export function trialHasExpired(createdAtIso: string | null | undefined, now = Date.now()): boolean {
  if (!createdAtIso) return true;
  return now >= trialEndTimestamp(createdAtIso);
}

export function hasFreeTrialAccess(
  createdAtIso: string | null | undefined,
  subscriptionStatus: string | null | undefined,
  now = Date.now(),
): boolean {
  if (subscriptionIsActive(subscriptionStatus)) return true;
  if (!createdAtIso) return false;
  return now < trialEndTimestamp(createdAtIso);
}
