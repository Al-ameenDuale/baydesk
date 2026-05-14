export type ProfileRecord = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  shop_name: string | null;
  shop_address: string | null;
  profile_image_url: string | null;
  is_subscriber?: boolean | null;
  subscription_status?: string | null;
};

export function displayName(
  p: Pick<ProfileRecord, "first_name" | "last_name"> | null,
  emailFallback?: string | null,
): string {
  const f = p?.first_name?.trim() ?? "";
  const l = p?.last_name?.trim() ?? "";
  if (f || l) return [f, l].filter(Boolean).join(" ");
  if (emailFallback) return emailFallback.split("@")[0] ?? "User";
  return "User";
}

export function initials(
  p: Pick<ProfileRecord, "first_name" | "last_name"> | null,
  emailFallback?: string | null,
): string {
  const f = p?.first_name?.trim().charAt(0) ?? "";
  const l = p?.last_name?.trim().charAt(0) ?? "";
  if (f && l) return (f + l).toUpperCase();
  if (f) return f.toUpperCase().slice(0, 2);
  const local = emailFallback?.split("@")[0] ?? "U";
  return local.slice(0, 2).toUpperCase();
}
