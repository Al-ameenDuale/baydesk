import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  verifyWebhook,
  type DodoSubscriptionData,
  type DodoPaymentData,
} from "@/lib/dodo";

export const runtime = "nodejs";

/* ------------------------------------------------------------------
 * Testing checklist (simulate via Dodo dashboard → Developer → Webhooks → Testing):
 *
 *  1. Create checkout session → complete payment → verify subscription.active
 *     fires and profiles.subscription_status = "active", is_subscriber = true.
 *
 *  2. Simulate payment.succeeded → verify no DB error (logged only).
 *
 *  3. Simulate payment.failed → verify subscription_status = "past_due".
 *
 *  4. Simulate subscription.cancelled → verify subscription_status = "cancelled".
 *
 *  5. After each webhook, query profiles table and confirm the row
 *     for the customer email reflects the expected status.
 * ------------------------------------------------------------------ */

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  const webhookId = request.headers.get("webhook-id") ?? "";
  const webhookSignature = request.headers.get("webhook-signature") ?? "";
  const webhookTimestamp = request.headers.get("webhook-timestamp") ?? "";

  if (!webhookId || !webhookSignature || !webhookTimestamp) {
    return NextResponse.json(
      { error: "Missing webhook headers" },
      { status: 400 },
    );
  }

  let event;
  try {
    event = verifyWebhook(rawBody, {
      "webhook-id": webhookId,
      "webhook-signature": webhookSignature,
      "webhook-timestamp": webhookTimestamp,
    });
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const { type, data } = event;

  try {
    switch (type) {
      case "subscription.active":
      case "subscription.renewed":
        await handleSubscriptionActive(data as unknown as DodoSubscriptionData);
        break;

      case "subscription.updated":
        await handleSubscriptionUpdated(data as unknown as DodoSubscriptionData);
        break;

      case "subscription.cancelled":
        await handleSubscriptionCancelled(data as unknown as DodoSubscriptionData);
        break;

      case "subscription.expired":
        await handleSubscriptionExpired(data as unknown as DodoSubscriptionData);
        break;

      case "subscription.on_hold":
      case "subscription.failed":
        await handleSubscriptionHold(data as unknown as DodoSubscriptionData);
        break;

      case "payment.succeeded":
        await handlePaymentSucceeded(data as unknown as DodoPaymentData);
        break;

      case "payment.failed":
        await handlePaymentFailed(data as unknown as DodoPaymentData);
        break;

      default:
        console.debug(`[dodo-webhook] unhandled event type: ${type}`);
    }
  } catch (err) {
    console.error(`[dodo-webhook] handler error for ${type}:`, err);
    return NextResponse.json(
      { error: "Internal processing error" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

/* ------------------------------------------------------------------ */
/*  Event handlers                                                     */
/* ------------------------------------------------------------------ */

async function handleSubscriptionActive(sub: DodoSubscriptionData) {
  const email = sub.customer?.email?.trim();
  if (!email) {
    console.warn("[dodo-webhook] subscription.active missing customer email");
    return;
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_status: "active",
      is_subscriber: true,
      subscription_id: sub.subscription_id ?? null,
      renewal_date: sub.next_billing_date ?? null,
      payment_provider: "dodo",
    })
    .eq("email", email);

  if (error) {
    console.error("[dodo-webhook] subscription.active DB error:", error.message);
    throw error;
  }

  console.debug(`[dodo-webhook] subscription activated for ${email}`);
}

async function handleSubscriptionUpdated(sub: DodoSubscriptionData) {
  const email = sub.customer?.email?.trim();
  if (!email) return;

  const supabase = getSupabaseAdmin();
  const update: Record<string, unknown> = {
    renewal_date: sub.next_billing_date ?? null,
  };
  if (sub.status) update.subscription_status = sub.status;

  const { error } = await supabase
    .from("profiles")
    .update(update)
    .eq("email", email);

  if (error) {
    console.error("[dodo-webhook] subscription.updated DB error:", error.message);
    throw error;
  }

  console.debug(`[dodo-webhook] subscription updated for ${email}`);
}

async function handleSubscriptionCancelled(sub: DodoSubscriptionData) {
  const email = sub.customer?.email?.trim();
  if (!email) return;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("profiles")
    .update({ subscription_status: "cancelled" })
    .eq("email", email);

  if (error) {
    console.error("[dodo-webhook] subscription.cancelled DB error:", error.message);
    throw error;
  }

  console.debug(`[dodo-webhook] subscription cancelled for ${email}`);
}

async function handleSubscriptionExpired(sub: DodoSubscriptionData) {
  const email = sub.customer?.email?.trim();
  if (!email) return;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("profiles")
    .update({ subscription_status: "expired", is_subscriber: false })
    .eq("email", email);

  if (error) {
    console.error("[dodo-webhook] subscription.expired DB error:", error.message);
    throw error;
  }

  console.debug(`[dodo-webhook] subscription expired for ${email}`);
}

async function handleSubscriptionHold(sub: DodoSubscriptionData) {
  const email = sub.customer?.email?.trim();
  if (!email) return;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("profiles")
    .update({ subscription_status: "past_due" })
    .eq("email", email);

  if (error) {
    console.error("[dodo-webhook] subscription.on_hold DB error:", error.message);
    throw error;
  }

  console.debug(`[dodo-webhook] subscription on hold for ${email}`);
}

async function handlePaymentSucceeded(payment: DodoPaymentData) {
  const email = payment.customer?.email?.trim();
  console.debug(
    `[dodo-webhook] payment.succeeded for ${email ?? "unknown"}, payment_id=${payment.payment_id}`,
  );
}

async function handlePaymentFailed(payment: DodoPaymentData) {
  const email = payment.customer?.email?.trim();
  if (!email) return;

  console.warn(
    `[dodo-webhook] payment.failed for ${email}, payment_id=${payment.payment_id}`,
  );

  if (payment.subscription_id) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("profiles")
      .update({ subscription_status: "past_due" })
      .eq("email", email);

    if (error) {
      console.error("[dodo-webhook] payment.failed DB error:", error.message);
      throw error;
    }
  }
}

export function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
