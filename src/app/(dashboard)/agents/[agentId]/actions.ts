"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getNextVersionNumber } from "@/lib/auth";
import { KNOWN_TOOL_NAMES } from "@/lib/data/dashboard";
import { createClient } from "@/lib/supabase/server";

async function getScopedAgent(agentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: agent, error } = await supabase
    .from("hermes_agents")
    .select("*")
    .eq("id", agentId)
    .single();

  if (error || !agent) {
    throw error ?? new Error("Agent not found");
  }

  return { supabase, user, agent };
}

function booleanFromForm(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

export async function updateAgentSettingsAction(
  agentId: string,
  formData: FormData,
) {
  const { supabase } = await getScopedAgent(agentId);

  const { error } = await supabase
    .from("hermes_agents")
    .update({
      name: String(formData.get("name") ?? ""),
      role: String(formData.get("role") ?? "assistant"),
      status: String(formData.get("status") ?? "active"),
      tone: String(formData.get("tone") ?? ""),
      model_tier: String(formData.get("model_tier") ?? "I2_BALANCED"),
      model_target: String(formData.get("model_target") ?? ""),
      temperature: Number(formData.get("temperature") ?? 0.3),
      legacy_state: String(formData.get("legacy_state") ?? "none"),
      channel_owner: String(formData.get("channel_owner") ?? ""),
    })
    .eq("id", agentId);

  if (error) {
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/agents");
  revalidatePath(`/agents/${agentId}`);
  redirect(`/agents/${agentId}?updated=profile`);
}

export async function createPromptVersionAction(
  agentId: string,
  formData: FormData,
) {
  const { supabase, user, agent } = await getScopedAgent(agentId);

  const { data: existingVersions, error: versionsError } = await supabase
    .from("hermes_agent_versions")
    .select("version_number")
    .eq("organization_id", agent.organization_id)
    .eq("agent_id", agentId);

  if (versionsError) {
    throw versionsError;
  }

  const systemPrompt = String(formData.get("system_prompt") ?? "").trim();
  const changeReason = String(formData.get("change_reason") ?? "").trim();

  if (!systemPrompt) {
    redirect(`/agents/${agentId}?error=empty-prompt`);
  }

  const versionNumber = getNextVersionNumber(
    (existingVersions ?? []).map((version) => version.version_number),
  );

  const promptSummary =
    systemPrompt.length > 160
      ? `${systemPrompt.slice(0, 157)}...`
      : systemPrompt;

  const { data: createdVersion, error: insertError } = await supabase
    .from("hermes_agent_versions")
    .insert({
      agent_id: agentId,
      organization_id: agent.organization_id,
      version_number: versionNumber,
      system_prompt: systemPrompt,
      prompt_summary: promptSummary,
      change_reason: changeReason || null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (insertError || !createdVersion) {
    throw insertError ?? new Error("Unable to create prompt version");
  }

  const { error: updateError } = await supabase
    .from("hermes_agents")
    .update({ active_version_id: createdVersion.id })
    .eq("id", agentId);

  if (updateError) {
    throw updateError;
  }

  revalidatePath("/agents");
  revalidatePath(`/agents/${agentId}`);
  redirect(`/agents/${agentId}?updated=prompt`);
}

export async function updateAgentToolingAction(
  agentId: string,
  formData: FormData,
) {
  const { supabase, agent } = await getScopedAgent(agentId);

  const { error: settingsError } = await supabase
    .from("agent_tool_settings")
    .upsert(
      {
        agent_id: agentId,
        organization_id: agent.organization_id,
        executor_type: String(formData.get("executor_type") ?? "none"),
        status: String(formData.get("tool_status") ?? "shadow"),
        n8n_webhook_url:
          String(formData.get("n8n_webhook_url") ?? "").trim() || null,
        tools_enabled: booleanFromForm(formData, "tools_enabled"),
      },
      { onConflict: "agent_id" },
    );

  if (settingsError) {
    throw settingsError;
  }

  const permissions = KNOWN_TOOL_NAMES.map((toolName) => ({
    agent_id: agentId,
    organization_id: agent.organization_id,
    tool_name: toolName,
    enabled: booleanFromForm(formData, `${toolName}_enabled`),
    requires_approval: booleanFromForm(
      formData,
      `${toolName}_requires_approval`,
    ),
    risk_level: String(formData.get(`${toolName}_risk_level`) ?? "medium"),
  }));

  const { error: permissionsError } = await supabase
    .from("agent_tool_permissions")
    .upsert(permissions, { onConflict: "agent_id,tool_name" });

  if (permissionsError) {
    throw permissionsError;
  }

  revalidatePath("/");
  revalidatePath("/agents");
  revalidatePath(`/agents/${agentId}`);
  redirect(`/agents/${agentId}?updated=tools`);
}
