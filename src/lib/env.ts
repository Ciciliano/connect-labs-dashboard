import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

const adminEnvSchema = publicEnvSchema.extend({
  SUPABASE_SECRET_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  HERMES_ADMIN_BOOTSTRAP_ENABLED: z.enum(["true", "false"]).optional(),
  HERMES_BOOTSTRAP_ORGANIZATION_SLUG: z.string().min(1).default("connect-labs"),
  HERMES_BOOTSTRAP_ADMIN_EMAIL: z.email().optional(),
  HERMES_BOOTSTRAP_ADMIN_PASSWORD: z.string().min(8).optional(),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type AdminEnv = z.infer<typeof adminEnvSchema> & {
  supabaseSecretKey: string;
};

function readPublicEnvSource() {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
}

function readAdminEnvSource() {
  return {
    ...readPublicEnvSource(),
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    HERMES_ADMIN_BOOTSTRAP_ENABLED: process.env.HERMES_ADMIN_BOOTSTRAP_ENABLED,
    HERMES_BOOTSTRAP_ORGANIZATION_SLUG:
      process.env.HERMES_BOOTSTRAP_ORGANIZATION_SLUG,
    HERMES_BOOTSTRAP_ADMIN_EMAIL: process.env.HERMES_BOOTSTRAP_ADMIN_EMAIL,
    HERMES_BOOTSTRAP_ADMIN_PASSWORD:
      process.env.HERMES_BOOTSTRAP_ADMIN_PASSWORD,
  };
}

export function parsePublicEnv(
  env: Partial<NodeJS.ProcessEnv> = readPublicEnvSource(),
): PublicEnv {
  return publicEnvSchema.parse(env);
}

export function parseAdminEnv(
  env: Partial<NodeJS.ProcessEnv> = readAdminEnvSource(),
): AdminEnv {
  const parsed = adminEnvSchema.parse(env);
  const supabaseSecretKey =
    parsed.SUPABASE_SECRET_KEY ?? parsed.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseSecretKey) {
    throw new Error(
      "Missing server-side Supabase secret. Set SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return {
    ...parsed,
    supabaseSecretKey,
  };
}

export function isBootstrapEnabled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return env.HERMES_ADMIN_BOOTSTRAP_ENABLED === "true";
}
