import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

type IpSource = "x-vercel-forwarded-for" | "x-forwarded-for" | "x-real-ip" | "fallback";

/**
 * Extract the client IP using the most trustworthy header available.
 *
 * Priority:
 *  1. x-vercel-forwarded-for — set by Vercel, survives upstream proxies
 *  2. x-forwarded-for — Vercel *overwrites* this (not appends) to the
 *     real client IP, preventing spoofing on Vercel-hosted deployments.
 *     In non-Vercel environments it may contain a comma-separated chain;
 *     we take the *rightmost* non-empty value (the one the last trusted
 *     proxy appended).
 *  3. x-real-ip — identical to x-forwarded-for on Vercel
 *  4. "unknown" fallback — still rate-limited (all unknown IPs share a bucket)
 */
function getClientIp(req: NextRequest): { ip: string; source: IpSource } {
  const vercelFwd = req.headers.get("x-vercel-forwarded-for")?.trim();
  if (vercelFwd) {
    return { ip: vercelFwd.split(",").pop()!.trim(), source: "x-vercel-forwarded-for" };
  }

  const xfwd = req.headers.get("x-forwarded-for")?.trim();
  if (xfwd) {
    const parts = xfwd.split(",").map((s) => s.trim()).filter(Boolean);
    const ip = parts.length > 0 ? parts[parts.length - 1] : "unknown";
    return { ip, source: "x-forwarded-for" };
  }

  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return { ip: realIp, source: "x-real-ip" };
  }

  return { ip: "unknown", source: "fallback" };
}

export async function POST(req: NextRequest) {
  const { ip, source } = getClientIp(req);

  console.debug(
    `[rate-limit] ip=${ip} source=${source} path=/api/auth/login`,
  );

  const { allowed, remaining } = rateLimit(`login:${ip}`, {
    maxAttempts: MAX_ATTEMPTS,
    windowMs: WINDOW_MS,
  });

  console.debug(
    `[rate-limit] ip=${ip} allowed=${allowed} remaining=${remaining}`,
  );

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again in 15 minutes." },
      { status: 429 },
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: "Missing Supabase configuration" },
      { status: 500 },
    );
  }

  let body: { email?: string; password?: string } | null = null;
  try {
    body = (await req.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = body?.email?.trim();
  const password = body?.password;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 },
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 401 });
  }

  return NextResponse.json({
    session: data.session,
    user: data.user,
  });
}
