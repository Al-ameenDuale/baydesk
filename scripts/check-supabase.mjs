import fs from "node:fs";

function parseDotenv(contents) {
  /** @type {Record<string, string>} */
  const env = {};
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    const key = line.slice(0, i).trim();
    let value = line.slice(i + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

async function main() {
  const dotenvPath = ".env.local";
  const raw = fs.readFileSync(dotenvPath, "utf8");
  const env = parseDotenv(raw);

  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error(
      `Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in ${dotenvPath}`
    );
    process.exit(2);
  }

  const endpoint = `${url.replace(/\/$/, "")}/auth/v1/settings`;
  console.log("Supabase settings check");
  console.log("url:", url);
  console.log("endpoint:", endpoint);

  const res = await fetch(endpoint, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
  });

  const contentType = res.headers.get("content-type") ?? "";
  const bodyText = await res.text();

  console.log("status:", res.status);
  console.log("content-type:", contentType);
  console.log("body-preview:", bodyText.slice(0, 300));

  if (!res.ok) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
