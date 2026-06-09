import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { MetricCard } from "@/components/metric-card";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardSnapshot } from "@/lib/data/dashboard";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const snapshot = await getDashboardSnapshot(supabase);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.16em] text-zinc-500">
            Visao operacional
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-50">
            {snapshot.organization?.name}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
            Painel principal dos agentes, da memoria consolidada e das filas
            operacionais. O runtime continua na VPS; o controle fica aqui.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={snapshot.organization?.status ?? "unknown"} />
          <div className="rounded-md border border-zinc-900 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-300">
            Plano {snapshot.organization?.plan}
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {snapshot.metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="border-zinc-900 bg-zinc-950">
          <CardHeader>
            <CardTitle className="text-zinc-50">Agentes</CardTitle>
          </CardHeader>
          <CardContent>
            {snapshot.agents.length === 0 ? (
              <EmptyState
                title="Sem agentes"
                body="Os agentes semeados no control plane ainda nao apareceram para este usuario."
              />
            ) : (
              <div className="space-y-3">
                {snapshot.agents.map((agent) => (
                  <Link
                    key={agent.id}
                    href={`/agents/${agent.id}`}
                    className="flex items-center justify-between rounded-md border border-zinc-900 bg-zinc-950/60 px-4 py-3 transition-colors hover:bg-zinc-900/70"
                  >
                    <div>
                      <p className="text-sm font-semibold text-zinc-100">{agent.name}</p>
                      <p className="mt-1 text-sm text-zinc-400">
                        {agent.slug} · {agent.model_tier} · {agent.role}
                      </p>
                    </div>
                    <StatusBadge status={agent.status} />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-900 bg-zinc-950">
          <CardHeader>
            <CardTitle className="text-zinc-50">Executores de tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border border-zinc-900 bg-zinc-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                n8n
              </p>
              <p className="mt-2 text-3xl font-semibold text-zinc-50">
                {snapshot.executorSummary.n8n}
              </p>
            </div>
            <div className="rounded-md border border-zinc-900 bg-zinc-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                Native
              </p>
              <p className="mt-2 text-3xl font-semibold text-zinc-50">
                {snapshot.executorSummary.native}
              </p>
            </div>
            <div className="rounded-md border border-zinc-900 bg-zinc-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                None
              </p>
              <p className="mt-2 text-3xl font-semibold text-zinc-50">
                {snapshot.executorSummary.none}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
