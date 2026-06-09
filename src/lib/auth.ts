export type MembershipGateInput = {
  bootstrapEnabled: boolean;
  membershipCount: number;
};

export type MembershipGate = "ready" | "bootstrap" | "blocked";

export function resolveMembershipGate(
  input: MembershipGateInput,
): MembershipGate {
  if (input.membershipCount > 0) {
    return "ready";
  }

  if (input.bootstrapEnabled) {
    return "bootstrap";
  }

  return "blocked";
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function getNextVersionNumber(versionNumbers: number[]): number {
  if (versionNumbers.length === 0) {
    return 1;
  }

  return Math.max(...versionNumbers) + 1;
}
