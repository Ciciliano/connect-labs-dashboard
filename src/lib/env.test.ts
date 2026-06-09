import { describe, expect, it } from "vitest";

import { isBootstrapEnabled, parseAdminEnv, parsePublicEnv } from "@/lib/env";

describe("env parsing", () => {
  it("parses the public env contract", () => {
    const result = parsePublicEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_123",
    });

    expect(result.NEXT_PUBLIC_SUPABASE_URL).toBe("https://example.supabase.co");
    expect(result.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).toBe(
      "sb_publishable_123",
    );
  });

  it("prefers the explicit secret key when both server keys exist", () => {
    const result = parseAdminEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_123",
      SUPABASE_SECRET_KEY: "sb_secret_456",
      SUPABASE_SERVICE_ROLE_KEY: "service_role_789",
    });

    expect(result.supabaseSecretKey).toBe("sb_secret_456");
  });

  it("falls back to the legacy service-role key", () => {
    const result = parseAdminEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_123",
      SUPABASE_SERVICE_ROLE_KEY: "service_role_789",
    });

    expect(result.supabaseSecretKey).toBe("service_role_789");
  });

  it("enables bootstrap only when the flag is true", () => {
    expect(isBootstrapEnabled({ HERMES_ADMIN_BOOTSTRAP_ENABLED: "true" })).toBe(
      true,
    );
    expect(
      isBootstrapEnabled({ HERMES_ADMIN_BOOTSTRAP_ENABLED: "false" }),
    ).toBe(false);
    expect(isBootstrapEnabled({})).toBe(false);
  });
});
