import DodoPayments from "dodopayments";

let _client: DodoPayments | null = null;

/**
 * Returns a singleton Dodo Payments client configured from env vars.
 *
 * Required env vars:
 *   DODO_SECRET_KEY   — server-side secret API key (Bearer token)
 *   DODO_WEBHOOK_SECRET — webhook signing key for signature verification
 *
 * Optional:
 *   DODO_ENVIRONMENT — "test_mode" | "live_mode" (defaults to "test_mode")
 */
export function getDodoClient(): DodoPayments {
  if (_client) return _client;

  const bearerToken = process.env.DODO_SECRET_KEY;
  if (!bearerToken) {
    throw new Error("Missing DODO_SECRET_KEY environment variable");
  }

  const webhookKey = process.env.DODO_WEBHOOK_SECRET;

  const environment =
    (process.env.DODO_ENVIRONMENT as "test_mode" | "live_mode") ?? "test_mode";

  _client = new DodoPayments({ bearerToken, environment, webhookKey });
  return _client;
}

/**
 * Create a Dodo checkout session for a subscription product.
 *
 * @param productId  Dodo product ID (from dashboard)
 * @param email      Customer email (pre-filled in checkout)
 * @param returnUrl  URL to redirect after checkout
 * @param metadata   Arbitrary key-value pairs forwarded to webhooks
 * @param trialDays  Free trial period (default 14)
 */
export async function createCheckoutSession({
  productId,
  email,
  returnUrl,
  metadata,
  trialDays = 14,
}: {
  productId: string;
  email: string;
  returnUrl: string;
  metadata?: Record<string, string>;
  trialDays?: number;
}): Promise<{ sessionId: string; checkoutUrl: string }> {
  const client = getDodoClient();

  try {
    const session = await client.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      subscription_data: { trial_period_days: trialDays },
      customer: { email },
      return_url: returnUrl,
      metadata: metadata ?? {},
    });

    const checkoutUrl = session.checkout_url;
    if (!checkoutUrl) {
      throw new Error("Dodo returned a session without a checkout URL");
    }

    console.debug(
      `[dodo] checkout session created: id=${session.session_id} url=${checkoutUrl}`,
    );

    return {
      sessionId: session.session_id,
      checkoutUrl,
    };
  } catch (err) {
    console.error("[dodo] failed to create checkout session:", err);
    throw err;
  }
}

/**
 * Verify and unwrap a Dodo webhook payload using the SDK.
 *
 * Throws if the signature is invalid.
 */
export function verifyWebhook(
  rawBody: string,
  headers: {
    "webhook-id": string;
    "webhook-signature": string;
    "webhook-timestamp": string;
  },
): DodoWebhookEvent {
  const client = getDodoClient();

  try {
    const event = client.webhooks.unwrap(rawBody, { headers }) as unknown as DodoWebhookEvent;
    console.debug(`[dodo] webhook verified: type=${event.type}`);
    return event;
  } catch (err) {
    console.error("[dodo] webhook signature verification failed:", err);
    throw err;
  }
}

/* ------------------------------------------------------------------ */
/*  Shared types for webhook payloads                                  */
/* ------------------------------------------------------------------ */

export type DodoWebhookEvent = {
  business_id: string;
  type: string;
  timestamp: string;
  data: {
    payload_type: "Payment" | "Subscription" | "Refund" | "Dispute" | "LicenseKey";
    [key: string]: unknown;
  };
};

export type DodoSubscriptionData = {
  payload_type: "Subscription";
  subscription_id: string;
  status: string;
  customer: { customer_id: string; email: string; name: string };
  next_billing_date?: string | null;
  metadata?: Record<string, string>;
  [key: string]: unknown;
};

export type DodoPaymentData = {
  payload_type: "Payment";
  payment_id: string;
  status: string;
  customer: { customer_id: string; email: string; name: string };
  subscription_id?: string | null;
  metadata?: Record<string, string>;
  [key: string]: unknown;
};
