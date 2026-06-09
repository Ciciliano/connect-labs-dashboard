import { describe, expect, it } from "vitest";

import { buildPermissionDrafts } from "@/lib/data/agents";

describe("agent tooling shaping", () => {
  it("hydrates known tools even when the database is sparse", () => {
    const drafts = buildPermissionDrafts(
      ["query_availability", "create_followup", "trigger_n8n_flow"],
      [
        {
          tool_name: "query_availability",
          enabled: true,
          requires_approval: false,
          risk_level: "low",
        },
      ],
    );

    expect(drafts).toEqual([
      {
        tool_name: "query_availability",
        enabled: true,
        requires_approval: false,
        risk_level: "low",
      },
      {
        tool_name: "create_followup",
        enabled: false,
        requires_approval: true,
        risk_level: "medium",
      },
      {
        tool_name: "trigger_n8n_flow",
        enabled: false,
        requires_approval: true,
        risk_level: "medium",
      },
    ]);
  });
});
