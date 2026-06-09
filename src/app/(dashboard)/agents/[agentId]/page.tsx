import { notFound } from "next/navigation";

import { SubmitButton } from "@/components/submit-button";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getAgentDetail } from "@/lib/data/agents";
import { getOrganizationContext, KNOWN_TOOL_NAMES } from "@/lib/data/dashboard";
import { createClient } from "@/lib/supabase/server";
import {
  createPromptVersionAction,
  updateAgentSettingsAction,
  updateAgentToolingAction,
} from "@/app/(dashboard)/agents/[agentId]/actions";

export default async function AgentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ agentId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { agentId } = await params;
  const query = await searchParams;
  const supabase = await createClient();
  const context = await getOrganizationContext(supabase);

  if (!context.organization) {
    notFound();
  }

  const organization = context.organization;
  const detail = await getAgentDetail(supabase, organization.id, agentId);

  if (!detail.agent) {
    notFound();
  }

  const promptAction = createPromptVersionAction.bind(null, agentId);
  const settingsAction = updateAgentSettingsAction.bind(null, agentId);
  const toolingAction = updateAgentToolingAction.bind(null, agentId);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.16em] text-zinc-500">
            Agente
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-50">
            {detail.agent.name}
          </h1>
          <p className="mt-3 text-sm leading-7 text-zinc-400">
            {detail.agent.slug} · {detail.agent.model_tier} · {detail.agent.role}
          </p>
        </div>
        <StatusBadge status={detail.agent.status} />
      </header>

      {query.updated ? (
        <p className="text-sm text-emerald-400">
          Atualizacao aplicada com sucesso: {String(query.updated)}.
        </p>
      ) : null}
      {query.error ? (
        <p className="text-sm text-rose-400">
          Nao foi possivel concluir a operacao: {String(query.error)}.
        </p>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-zinc-900 bg-zinc-950">
          <CardHeader>
            <CardTitle className="text-zinc-50">Configuracao geral</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={settingsAction} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" name="name" defaultValue={detail.agent.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" name="role" defaultValue={detail.agent.role} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Input id="status" name="status" defaultValue={detail.agent.status} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model_tier">Tier</Label>
                <Input
                  id="model_tier"
                  name="model_tier"
                  defaultValue={detail.agent.model_tier}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model_target">Modelo alvo</Label>
                <Input
                  id="model_target"
                  name="model_target"
                  defaultValue={detail.agent.model_target ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperatura</Label>
                <Input
                  id="temperature"
                  name="temperature"
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  defaultValue={detail.agent.temperature}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="legacy_state">Estado legado</Label>
                <Input
                  id="legacy_state"
                  name="legacy_state"
                  defaultValue={detail.agent.legacy_state}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="channel_owner">Canal</Label>
                <Input
                  id="channel_owner"
                  name="channel_owner"
                  defaultValue={detail.agent.channel_owner ?? ""}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="tone">Tom</Label>
                <Textarea
                  id="tone"
                  name="tone"
                  defaultValue={detail.agent.tone ?? ""}
                  rows={4}
                />
              </div>
              <div className="md:col-span-2">
                <SubmitButton>Salvar configuracao</SubmitButton>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-zinc-900 bg-zinc-950">
          <CardHeader>
            <CardTitle className="text-zinc-50">Prompt ativo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border border-zinc-900 bg-zinc-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                Versao atual
              </p>
              <p className="mt-2 text-sm text-zinc-300">
                {detail.activeVersion
                  ? `v${detail.activeVersion.version_number}`
                  : "Sem versao ativa"}
              </p>
              {detail.activeVersion ? (
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  {detail.activeVersion.system_prompt}
                </p>
              ) : null}
            </div>
            <form action={promptAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="change_reason">Motivo da mudanca</Label>
                <Input id="change_reason" name="change_reason" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="system_prompt">Novo prompt</Label>
                <Textarea id="system_prompt" name="system_prompt" rows={12} />
              </div>
              <SubmitButton>Criar nova versao</SubmitButton>
            </form>
          </CardContent>
        </Card>
      </section>

      <Card className="border-zinc-900 bg-zinc-950">
        <CardHeader>
          <CardTitle className="text-zinc-50">Ferramentas e executor</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={toolingAction} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="executor_type">Executor</Label>
                <Input
                  id="executor_type"
                  name="executor_type"
                  defaultValue={detail.toolSettings.executor_type}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tool_status">Status</Label>
                <Input
                  id="tool_status"
                  name="tool_status"
                  defaultValue={detail.toolSettings.status}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="n8n_webhook_url">Webhook n8n</Label>
                <Input
                  id="n8n_webhook_url"
                  name="n8n_webhook_url"
                  defaultValue={detail.toolSettings.n8n_webhook_url ?? ""}
                />
              </div>
            </div>

            <label className="flex items-center gap-3 text-sm text-zinc-300">
              <input
                type="checkbox"
                name="tools_enabled"
                defaultChecked={detail.toolSettings.tools_enabled}
              />
              Tools habilitadas
            </label>

            <div className="grid gap-4 xl:grid-cols-3">
              {KNOWN_TOOL_NAMES.map((toolName) => {
                const draft = detail.permissionDrafts.find(
                  (permission) => permission.tool_name === toolName,
                );

                return (
                  <div
                    key={toolName}
                    className="rounded-lg border border-zinc-900 bg-zinc-950/60 p-4"
                  >
                    <p className="text-sm font-semibold text-zinc-100">{toolName}</p>
                    <div className="mt-4 space-y-3 text-sm text-zinc-300">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          name={`${toolName}_enabled`}
                          defaultChecked={draft?.enabled ?? false}
                        />
                        Habilitada
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          name={`${toolName}_requires_approval`}
                          defaultChecked={draft?.requires_approval ?? true}
                        />
                        Exige aprovacao
                      </label>
                      <div className="space-y-2">
                        <Label htmlFor={`${toolName}_risk_level`}>Risco</Label>
                        <Input
                          id={`${toolName}_risk_level`}
                          name={`${toolName}_risk_level`}
                          defaultValue={draft?.risk_level ?? "medium"}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <SubmitButton>Salvar tooling</SubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
