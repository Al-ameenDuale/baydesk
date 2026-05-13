import { createClient } from "@supabase/supabase-js";
import { createCheckoutSession } from "@/lib/dodo";

export const runtime = "nodejs";

function getBaseUrl(req: Request) {
  const url = new URL(req.url);
  const proto =
    req.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  const host =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? url.host;
  return `${proto}://${host}`;
}

export async function POST(req: Request) {
  const productId = process.env.DODO_PRODUCT_ID;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!productId) {
    return Response.json(
      { error: "Missing DODO_PRODUCT_ID in env vars" },
      { status: 500 },
    );
  }
  if (!supabaseUrl || !supabaseAnonKey) {
    return Response.json(
      { error: "Missing Supabase configuration" },
      { status: 500 },
    );
  }

  const authHeader =
    req.headers.get("authorization") ?? req.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : "";

  if (!token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = user.email?.trim();
  if (!email) {
    return Response.json(
      { error: "User has no email on file" },
      { status: 400 },
    );
  }

  const baseUrl = getBaseUrl(req);

  try {
    const { checkoutUrl } = await createCheckoutSession({
      productId,
      email,
      returnUrl: `${baseUrl}/dashboard`,
      metadata: { supabase_user_id: user.id },
      trialDays: 14,
    });

    return Response.json({ url: checkoutUrl });
  } catch (err) {
    console.error("[dodo-checkout] failed:", err);
    const message =
      err instanceof Error ? err.message : "Could not create checkout.";
    return Response.json({ error: message }, { status: 502 });
  }
}
