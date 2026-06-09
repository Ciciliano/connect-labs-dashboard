import { describe, expect, it } from "vitest";

import { splitTasksByAttention } from "@/lib/data/tasks";

describe("task shaping", () => {
  it("groups tasks that need immediate attention", () => {
    const grouped = splitTasksByAttention([
      {
        id: "t1",
        status: "failed",
        requires_approval: false,
      },
      {
        id: "t2",
        status: "pending",
        requires_approval: true,
      },
      {
        id: "t3",
        status: "approved",
        requires_approval: false,
      },
      {
        id: "t4",
        status: "completed",
        requires_approval: false,
      },
    ]);

    expect(grouped.failed.map((task) => task.id)).toEqual(["t1"]);
    expect(grouped.awaitingApproval.map((task) => task.id)).toEqual(["t2"]);
    expect(grouped.upNext.map((task) => task.id)).toEqual(["t3"]);
    expect(grouped.recent.map((task) => task.id)).toEqual(["t4"]);
  });
});
