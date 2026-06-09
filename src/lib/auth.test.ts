import { describe, expect, it } from "vitest";

import {
  getNextVersionNumber,
  normalizeEmail,
  resolveMembershipGate,
} from "@/lib/auth";

describe("auth helpers", () => {
  it("routes to bootstrap when no membership exists and bootstrap is enabled", () => {
    expect(
      resolveMembershipGate({
        bootstrapEnabled: true,
        membershipCount: 0,
      }),
    ).toBe("bootstrap");
  });

  it("blocks access when no membership exists and bootstrap is disabled", () => {
    expect(
      resolveMembershipGate({
        bootstrapEnabled: false,
        membershipCount: 0,
      }),
    ).toBe("blocked");
  });

  it("accepts existing memberships immediately", () => {
    expect(
      resolveMembershipGate({
        bootstrapEnabled: false,
        membershipCount: 1,
      }),
    ).toBe("ready");
  });

  it("normalizes the admin email for bootstrap and login", () => {
    expect(normalizeEmail("  Anderson.Santos001@Gmail.com ")).toBe(
      "anderson.santos001@gmail.com",
    );
  });

  it("increments prompt versions deterministically", () => {
    expect(getNextVersionNumber([])).toBe(1);
    expect(getNextVersionNumber([1, 2, 4])).toBe(5);
  });
});
