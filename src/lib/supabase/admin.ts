import { createClient } from "@supabase/supabase-js";

import { parseAdminEnv } from "@/lib/env";

export function createAdminClient() {
  const env = parseAdminEnv();

  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.supabaseSecretKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
