import type { SupabaseClient } from "@supabase/supabase-js";

import { KNOWN_TOOL_NAMES } from "@/lib/data/dashboard";
import type { Database } from "@/lib/supabase/types";

type AppClient = SupabaseClient<Database>;
type AgentRow = Database["public"]["Tables"]["hermes_agents"]["Row"];
type VersionRow = Database["public"]["Tables"]["hermes_agent_versions"]["Row"];
type ToolSettingRow = Database["public"]["Tables"]["agent_tool_settings"]["Row"];

type PermissionDraft = {
  tool_name: string;
  enabled: boolean;
  requires_approval: boolean;
  risk_level: string;
};

export function buildPermissionDrafts(
  toolNames: readonly string[],
  rows: PermissionDraft[],
): PermissionDraft[] {
  return toolNames.map((toolName) => {
    const existing = rows.find((row) => row.tool_name === toolName);

    return (
      existing ?? {
        tool_name: toolName,
        enabled: false,
        requires_approval: true,
        risk_level: "medium",
      }
    );
  });
}

export async function listAgents(client: AppClient, organizationId: string) {
  const { data, error } = await client
    .from("hermes_agents")
    .select("*")
    .eq("organization_id", organizationId)
    .order("slug");

  if (error) {
    throw error;
  }

  return (data ?? []) as AgentRow[];
}

export async function getAgentDetail(
  client: AppClient,
  organizationId: string,
  agentId: string,
) {
  const [agentResult, versionsResult, toolSettingsResult, permissionsResult] =
    await Promise.all([
      client
        .from("hermes_agents")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("id", agentId)
        .single(),
      client
        .from("hermes_agent_versions")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("agent_id", agentId)
        .order("version_number", { ascending: false }),
      client
        .from("agent_tool_settings")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("agent_id", agentId)
        .maybeSingle(),
      client
        .from("agent_tool_permissions")
        .select("tool_name, enabled, requires_approval, risk_level")
        .eq("organization_id", organizationId)
        .eq("agent_id", agentId),
    ]);

  if (agentResult.error) {
    throw agentResult.error;
  }

  if (versionsResult.error) {
    throw versionsResult.error;
  }

  if (toolSettingsResult.error) {
    throw toolSettingsResult.error;
  }

  if (permissionsResult.error) {
    throw permissionsResult.error;
  }

  const agent = agentResult.data as AgentRow;
  const versions = (versionsResult.data ?? []) as VersionRow[];
  const toolSettings =
    (toolSettingsResult.data as ToolSettingRow | null) ??
    ({
      agent_id: agentId,
      created_at: "",
      executor_type: "none",
      id: "draft",
      n8n_webhook_url: null,
      organization_id: organizationId,
      status: "shadow",
      tools_enabled: false,
      updated_at: "",
    } satisfies ToolSettingRow);

  return {
    agent,
    versions,
    activeVersion: versions.find((version) => version.id === agent.active_version_id) ?? null,
    toolSettings,
    permissionDrafts: buildPermissionDrafts(
      KNOWN_TOOL_NAMES,
      permissionsResult.data ?? [],
    ),
  };
}
