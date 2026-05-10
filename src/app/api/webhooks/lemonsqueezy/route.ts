import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function timingSafeEqualHex(aHex: string, bHex: string) {
  const a = Buffer.from(aHex, "hex");
  const b = Buffer.from(bHex, "hex");
  if (a.length === 0 || b.length === 0 || a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

type LemonWebhookPayload = {
  meta?: { event_name?: string };
  data?: {
    id?: string | number;
    attributes?: {
      user_email?: string | null;
      variant_id?: string | number | null;
      renews_at?: string | null;
    };
  };
};

export async function POST(request: Request) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!secret || secret === "YOUR_LEMONSQUEEZY_WEBHOOK_SECRET") {
    return NextResponse.json(
      { error: "Missing LEMONSQUEEZY_WEBHOOK_SECRET" },
      { status: 500 },
    );
  }
  if (!serviceRole || serviceRole === "YOUR_SUPABASE_SERVICE_ROLE_KEY") {
    return NextResponse.json(
      { error: "Missing SUPABASE_SERVICE_ROLE_KEY" },
      { status: 500 },
    );
  }
  if (!supabaseUrl) {
    return NextResponse.json({ error: "Missing NEXT_PUBLIC_SUPABASE_URL" }, { status: 500 });
  }

  const rawBody = await request.text();
  const signature =
    request.headers.get("x-signature") ?? request.headers.get("X-Signature") ?? "";

  const hmacHex = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  if (!timingSafeEqualHex(hmacHex, signature.trim())) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: LemonWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as LemonWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventName = payload.meta?.event_name;
  const subscriptionId = payload.data?.id;
  const attrs = payload.data?.attributes;
  const userEmail =
    typeof attrs?.user_email === "string" ? attrs.user_email.trim() : undefined;
  const variantId = attrs?.variant_id;
  const renewsAt = attrs?.renews_at ?? undefined;

  const handledEvents = new Set([
    "subscription_created",
    "subscription_cancelled",
    "subscription_expired",
  ]);

  if (!eventName || !handledEvents.has(eventName)) {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  if (!userEmail) {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false },
  });

  if (eventName === "subscription_created") {
    const sid =
      subscriptionId === undefined || subscriptionId === null
        ? null
        : String(subscriptionId);

    const update: Record<string, unknown> = {
      subscription_status: "active",
      is_subscriber: true,
      subscription_id: sid,
      variant_id:
        variantId === undefined || variantId === null ? null : String(variantId),
      renewal_date: renewsAt ?? null,
    };

    const { error } = await supabaseAdmin.from("profiles").update(update).eq("email", userEmail);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  }

  if (eventName === "subscription_cancelled") {
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ subscription_status: "cancelled" })
      .eq("email", userEmail);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  }

  // subscription_expired
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ subscription_status: "expired" })
    .eq("email", userEmail);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

export function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
