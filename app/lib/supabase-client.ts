import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "./database.types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function ensureConfig() {
  if (!url || !anonKey) {
    throw new Error(
      "Les variables NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont requises."
    );
  }

  return { url, anonKey };
}

export function supabaseBrowser() {
  const config = ensureConfig();

  return createBrowserSupabaseClient<Database>({
    supabaseUrl: config.url,
    supabaseKey: config.anonKey,
  });
}
