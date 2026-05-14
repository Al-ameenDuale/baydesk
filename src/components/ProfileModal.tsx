"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { ProfileRecord } from "@/lib/profileTypes";

type ProfileModalProps = {
  open: boolean;
  onClose: () => void;
  userId: string;
  email: string | null;
  initial: ProfileRecord | null;
  onSaved: (row: ProfileRecord) => void;
};

const inputClass =
  "mt-1 w-full min-h-11 rounded-md border border-zinc-300 px-3 text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900";

async function fileToJpegBlob(file: File): Promise<Blob> {
  if (file.type === "image/jpeg") return file;
  return new Promise((resolve, reject) => {
    const img = new globalThis.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      const max = 1024;
      let { width, height } = img;
      if (width > max || height > max) {
        const r = Math.min(max / width, max / height);
        width = Math.round(width * r);
        height = Math.round(height * r);
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not read image"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error("Could not encode image"));
        },
        "image/jpeg",
        0.9,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Invalid image"));
    };
    img.src = url;
  });
}

export function ProfileModal({
  open,
  onClose,
  userId,
  email,
  initial,
  onSaved,
}: ProfileModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [shopName, setShopName] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetFromInitial = useCallback(() => {
    setFirstName(initial?.first_name ?? "");
    setLastName(initial?.last_name ?? "");
    setPhone(initial?.phone_number ?? "");
    setShopName(initial?.shop_name ?? "");
    setShopAddress(initial?.shop_address ?? "");
    setImageUrl(initial?.profile_image_url ?? null);
    setMessage(null);
    setError(null);
  }, [initial]);

  useEffect(() => {
    if (open) resetFromInitial();
  }, [open, resetFromInitial]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be 5MB or smaller.");
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const blob = await fileToJpegBlob(file);
      const path = `user-${userId}.jpg`;
      const { error: upErr } = await supabase.storage
        .from("profiles")
        .upload(path, blob, {
          upsert: true,
          contentType: "image/jpeg",
        });
      if (upErr) throw upErr;

      const { data } = supabase.storage.from("profiles").getPublicUrl(path);
      const publicUrl = data.publicUrl;
      setImageUrl(`${publicUrl}?t=${Date.now()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setMessage(null);

    const payload = {
      first_name: firstName.trim() || null,
      last_name: lastName.trim() || null,
      phone_number: phone.trim() || null,
      shop_name: shopName.trim() || null,
      shop_address: shopAddress.trim() || null,
      profile_image_url: imageUrl?.split("?")[0] ?? null,
    };

    const selectCols =
      "id, first_name, last_name, phone_number, shop_name, shop_address, profile_image_url, is_subscriber, subscription_status";

    let { data, error: upErr } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", userId)
      .select(selectCols)
      .maybeSingle();

    if (upErr) {
      setSaving(false);
      setError(upErr.message);
      return;
    }

    if (!data) {
      const inserted = await supabase
        .from("profiles")
        .insert({ id: userId, ...payload })
        .select(selectCols)
        .single();
      setSaving(false);
      if (inserted.error) {
        setError(inserted.error.message);
        return;
      }
      data = inserted.data;
    } else {
      setSaving(false);
    }

    if (!data) {
      setSaving(false);
      setError("Could not save profile.");
      return;
    }

    const row = data as ProfileRecord;
    setMessage("Profile saved.");
    onSaved(row);
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close profile"
        className={`fixed inset-0 z-[80] bg-black/40 transition-opacity duration-200 ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed right-0 top-0 z-[90] flex h-full w-[min(100%,22rem)] max-w-[100vw] flex-col border-l border-zinc-200 bg-white shadow-2xl transition-transform duration-200 ease-out sm:w-[26rem] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-4">
          <h2 id="profile-modal-title" className="text-lg font-semibold text-zinc-900">
            Profile
          </h2>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {message && (
            <p className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              {message}
            </p>
          )}
          {error && (
            <p className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              {error}
            </p>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-600" htmlFor="pf-first">
                First name
              </label>
              <input
                id="pf-first"
                className={inputClass}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-600" htmlFor="pf-last">
                Last name
              </label>
              <input
                id="pf-last"
                className={inputClass}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-600" htmlFor="pf-email">
                Email
              </label>
              <input
                id="pf-email"
                className={`${inputClass} cursor-not-allowed bg-zinc-100 text-zinc-600`}
                value={email ?? ""}
                readOnly
                disabled
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-600" htmlFor="pf-phone">
                Phone number
              </label>
              <input
                id="pf-phone"
                className={inputClass}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                autoComplete="tel"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-600" htmlFor="pf-shop">
                Shop name
              </label>
              <input
                id="pf-shop"
                className={inputClass}
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-600" htmlFor="pf-addr">
                Shop address
              </label>
              <textarea
                id="pf-addr"
                rows={3}
                className={`${inputClass} min-h-[5.5rem] py-2`}
                value={shopAddress}
                onChange={(e) => setShopAddress(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-600" htmlFor="pf-photo">
                Profile photo
              </label>
              <input
                id="pf-photo"
                type="file"
                accept="image/*"
                className="mt-2 block w-full min-w-0 text-sm text-zinc-700 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
                disabled={uploading}
                onChange={(e) => void handleFileChange(e)}
              />
              {uploading && (
                <p className="mt-1 text-xs text-zinc-500">Uploading…</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 border-t border-zinc-200 p-4">
          <button
            type="button"
            className="flex min-h-11 flex-1 items-center justify-center rounded-md border border-zinc-300 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="flex min-h-11 flex-1 items-center justify-center rounded-md bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
            disabled={saving}
            onClick={() => void handleSave()}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </>
  );
}
