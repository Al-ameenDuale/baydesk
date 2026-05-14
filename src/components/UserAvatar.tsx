"use client";

import type { ProfileRecord } from "@/lib/profileTypes";
import { initials } from "@/lib/profileTypes";

type UserAvatarProps = {
  profile: Pick<ProfileRecord, "first_name" | "last_name" | "profile_image_url"> | null;
  email?: string | null;
  size?: "sm" | "md";
  onClick?: () => void;
  className?: string;
};

const sizeClasses = {
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
};

export function UserAvatar({
  profile,
  email,
  size = "md",
  onClick,
  className = "",
}: UserAvatarProps) {
  const url = profile?.profile_image_url?.trim();
  const label = initials(profile, email);
  const interactive = Boolean(onClick);

  const base =
    `relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1B2A4A] font-semibold uppercase text-white ${sizeClasses[size]} ${interactive ? "cursor-pointer ring-offset-2 transition hover:opacity-90 focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#1B2A4A] " : ""}${className}`;

  if (url) {
    return (
      <button
        type="button"
        className={base}
        onClick={onClick}
        aria-label="Account menu"
        disabled={!interactive}
      >
        <img src={url} alt="" className="h-full w-full object-cover" />
      </button>
    );
  }

  return (
    <button
      type="button"
      className={base}
      onClick={onClick}
      aria-label="Account menu"
      disabled={!interactive}
    >
      {label}
    </button>
  );
}
