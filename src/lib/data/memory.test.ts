import { describe, expect, it } from "vitest";

import { summarizeFactTypes } from "@/lib/data/memory";

describe("memory shaping", () => {
  it("summarizes fact types for quick review", () => {
    expect(
      summarizeFactTypes([
        { fact_type: "operational_guardrail" },
        { fact_type: "operational_guardrail" },
        { fact_type: "preference" },
      ]),
    ).toEqual([
      { label: "operational_guardrail", value: "2" },
      { label: "preference", value: "1" },
    ]);
  });

  it("returns a stable empty state when no facts exist", () => {
    expect(summarizeFactTypes([])).toEqual([]);
  });
});
