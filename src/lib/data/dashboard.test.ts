import { describe, expect, it } from "vitest";

import {
  buildOverviewMetrics,
  summarizeExecutorModes,
} from "@/lib/data/dashboard";

describe("dashboard shaping", () => {
  it("builds stable overview metrics", () => {
    const metrics = buildOverviewMetrics({
      activeAgents: 3,
      archivedAgents: 1,
      memoryFacts: 208,
      openHandoffs: 2,
      pendingTasks: 4,
      conversations: 0,
    });

    expect(metrics).toEqual([
      { label: "Agentes ativos", value: "3" },
      { label: "Arquivados", value: "1" },
      { label: "Memorias validadas", value: "208" },
      { label: "Handoffs abertos", value: "2" },
      { label: "Tarefas pendentes", value: "4" },
      { label: "Conversas", value: "0" },
    ]);
  });

  it("summarizes executor modes for quick scanning", () => {
    expect(
      summarizeExecutorModes([
        { executor_type: "n8n" },
        { executor_type: "n8n" },
        { executor_type: "native" },
      ]),
    ).toEqual({
      n8n: 2,
      native: 1,
      none: 0,
    });
  });
});
