import type { SupabaseClient } from "@supabase/supabase-js";

import type { MembershipGate } from "@/lib/auth";
import { resolveMembershipGate } from "@/lib/auth";
import type { Database } from "@/lib/supabase/types";

export const KNOWN_TOOL_NAMES = [
  "query_availability",
  "create_followup",
  "trigger_n8n_flow",
] as const;

type AppClient = SupabaseClient<Database>;
type OrganizationRow = Database["public"]["Tables"]["organizations"]["Row"];
type MembershipRow = Database["public"]["Tables"]["organization_members"]["Row"];
type AgentRow = Database["public"]["Tables"]["hermes_agents"]["Row"];
type ToolSettingRow = Database["public"]["Tables"]["agent_tool_settings"]["Row"];

export type OrganizationContext = {
  gate: MembershipGate;
  membership: MembershipRow | null;
  organization: OrganizationRow | null;
};

export type DashboardMetric = {
  label: string;
  value: string;
};

export function buildOverviewMetrics(input: {
  activeAgents: number;
  archivedAgents: number;
  memoryFacts: number;
  openHandoffs: number;
  pendingTasks: number;
  conversations: number;
}): DashboardMetric[] {
  return [
    { label: "Agentes ativos", value: String(input.activeAgents) },
    { label: "Arquivados", value: String(input.archivedAgents) },
    { label: "Memorias validadas", value: String(input.memoryFacts) },
    { label: "Handoffs abertos", value: String(input.openHandoffs) },
    { label: "Tarefas pendentes", value: String(input.pendingTasks) },
    { label: "Conversas", value: String(input.conversations) },
  ];
}

export function summarizeExecutorModes(
  settings: Array<{ executor_type: string }>,
): Record<"n8n" | "native" | "none", number> {
  const summary = {
    n8n: 0,
    native: 0,
    none: 0,
  };

  settings.forEach((setting) => {
    if (setting.executor_type === "n8n") {
      summary.n8n += 1;
      return;
    }

    if (setting.executor_type === "native") {
      summary.native += 1;
      return;
    }

    summary.none += 1;
  });

  return summary;
}

async function unwrapCount(
  query: PromiseLike<{ count: number | null; error: Error | null }>,
) {
  const result = await query;

  if (result.error) {
    throw result.error;
  }

  return result.count ?? 0;
}

export async function getOrganizationContext(client: AppClient) {
  const { data: memberships, error: membershipError } = await client
    .from("organization_members")
    .select("organization_id, role")
    .limit(1);

  if (membershipError) {
    throw membershipError;
  }

  const membershipCount = memberships?.length ?? 0;
  const gate = resolveMembershipGate({
    bootstrapEnabled:
      process.env.HERMES_ADMIN_BOOTSTRAP_ENABLED === "true",
    membershipCount,
  });

  if (membershipCount === 0) {
    return {
      gate,
      membership: null,
      organization: null,
    } satisfies OrganizationContext;
  }

  const membership = memberships![0] as MembershipRow;
  const { data: organizationData, error: organizationError } = await client
    .from("organizations")
    .select("*")
    .eq("id", membership.organization_id)
    .single();

  if (organizationError) {
    throw organizationError;
  }

  const organization = organizationData as OrganizationRow;

  return {
    gate,
    membership,
    organization,
  } satisfies OrganizationContext;
}

export async function getDashboardSnapshot(client: AppClient) {
  const context = await getOrganizationContext(client);

  if (!context.organization || !context.membership) {
    return {
      ...context,
      agents: [] as AgentRow[],
      toolSettings: [] as ToolSettingRow[],
      metrics: buildOverviewMetrics({
        activeAgents: 0,
        archivedAgents: 0,
        memoryFacts: 0,
        openHandoffs: 0,
        pendingTasks: 0,
        conversations: 0,
      }),
      executorSummary: summarizeExecutorModes([]),
    };
  }

  const organization = context.organization;
  const organizationId = organization.id;

  const [
    agentsResult,
    toolSettingsResult,
    activeAgents,
    archivedAgents,
    memoryFacts,
    openHandoffs,
    pendingTasks,
    conversations,
  ] = await Promise.all([
    client
      .from("hermes_agents")
      .select("*")
      .eq("organization_id", organizationId)
      .order("slug"),
    client
      .from("agent_tool_settings")
      .select("*")
      .eq("organization_id", organizationId),
    unwrapCount(
      client
        .from("hermes_agents")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organizationId)
        .eq("status", "active"),
    ),
    unwrapCount(
      client
        .from("hermes_agents")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organizationId)
        .eq("status", "archived"),
    ),
    unwrapCount(
      client
        .from("agent_memory_facts")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organizationId),
    ),
    unwrapCount(
      client
        .from("human_handoffs")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organizationId)
        .eq("status", "open"),
    ),
    unwrapCount(
      client
        .from("agent_tasks")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organizationId)
        .in("status", ["pending", "approved"]),
    ),
    unwrapCount(
      client
        .from("conversations")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organizationId),
    ),
  ]);

  if (agentsResult.error) {
    throw agentsResult.error;
  }

  if (toolSettingsResult.error) {
    throw toolSettingsResult.error;
  }

  const toolSettings = (toolSettingsResult.data ?? []) as ToolSettingRow[];

  return {
    ...context,
    agents: (agentsResult.data ?? []) as AgentRow[],
    toolSettings,
    metrics: buildOverviewMetrics({
      activeAgents,
      archivedAgents,
      memoryFacts,
      openHandoffs,
      pendingTasks,
      conversations,
    }),
    executorSummary: summarizeExecutorModes(toolSettings),
  };
}
