import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";

type AppClient = SupabaseClient<Database>;
type AgentRow = Database["public"]["Tables"]["hermes_agents"]["Row"];
type MemoryFactRow = Database["public"]["Tables"]["agent_memory_facts"]["Row"];

export type MemoryFactSummary = {
  label: string;
  value: string;
};

export type MemoryFactWithAgent = MemoryFactRow & {
  agent_name: string | null;
};

export function summarizeFactTypes(
  facts: Array<{ fact_type: string }>,
): MemoryFactSummary[] {
  const counts = new Map<string, number>();

  facts.forEach((fact) => {
    counts.set(fact.fact_type, (counts.get(fact.fact_type) ?? 0) + 1);
  });

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([label, value]) => ({ label, value: String(value) }));
}

export async function getMemorySnapshot(
  client: AppClient,
  organizationId: string,
) {
  const [factsResult, agentsResult] = await Promise.all([
    client
      .from("agent_memory_facts")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(50),
    client
      .from("hermes_agents")
      .select("id, name")
      .eq("organization_id", organizationId),
  ]);

  if (factsResult.error) {
    throw factsResult.error;
  }

  if (agentsResult.error) {
    throw agentsResult.error;
  }

  const agents = (agentsResult.data ?? []) as Pick<AgentRow, "id" | "name">[];
  const agentNames = new Map(agents.map((agent) => [agent.id, agent.name]));
  const facts = ((factsResult.data ?? []) as MemoryFactRow[]).map((fact) => ({
    ...fact,
    agent_name: fact.agent_id ? (agentNames.get(fact.agent_id) ?? null) : null,
  }));

  return {
    facts,
    factTypes: summarizeFactTypes(facts),
  } satisfies {
    facts: MemoryFactWithAgent[];
    factTypes: MemoryFactSummary[];
  };
}
