import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function getBaseUrl(req: Request) {
  const url = new URL(req.url);
  const proto = req.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? url.host;
  return `${proto}://${host}`;
}

export async function POST(req: Request) {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  const variantId = process.env.LEMONSQUEEZY_VARIANT_ID;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!apiKey || apiKey === "YOUR_LEMONSQUEEZY_API_KEY") {
    return Response.json(
      { error: "Missing LEMONSQUEEZY_API_KEY in .env.local" },
      { status: 500 },
    );
  }
  if (!storeId || !variantId) {
    return Response.json(
      {
        error:
          "Missing LEMONSQUEEZY_STORE_ID and/or LEMONSQUEEZY_VARIANT_ID env vars (add them to .env.local).",
      },
      { status: 500 },
    );
  }
  if (!supabaseUrl || !supabaseAnonKey) {
    return Response.json(
      { error: "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY" },
      { status: 500 },
    );
  }

  const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization");
  const token =
    authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length).trim() : "";

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
    return Response.json({ error: "User has no email on file" }, { status: 400 });
  }

  const baseUrl = getBaseUrl(req);

  const res = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email,
            custom: {
              supabase_user_id: user.id,
            },
          },
          checkout_options: {
            skip_trial: false,
          },
          product_options: {
            redirect_url: `${baseUrl}/dashboard`,
          },
        },
        relationships: {
          store: { data: { type: "stores", id: String(storeId) } },
          variant: { data: { type: "variants", id: String(variantId) } },
        },
      },
    }),
  });

  const json = (await res.json().catch(() => null)) as {
    data?: { attributes?: { url?: string } };
    errors?: { detail?: string }[];
  } | null;
  const checkoutUrl = json?.data?.attributes?.url;

  if (!res.ok || !checkoutUrl) {
    return Response.json(
      { error: json?.errors?.[0]?.detail ?? "Could not create checkout." },
      { status: res.ok ? 400 : res.status },
    );
  }

  return Response.json({ url: checkoutUrl });
}
