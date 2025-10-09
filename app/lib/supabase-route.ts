import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

export function supabaseRoute() {
  return createRouteHandlerClient<Database>({ cookies });
}
