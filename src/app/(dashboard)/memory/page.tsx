import { format } from "date-fns";

import { EmptyState } from "@/components/empty-state";
import { MetricCard } from "@/components/metric-card";
import { StatusBadge } from "@/components/status-badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getOrganizationContext } from "@/lib/data/dashboard";
import { getMemorySnapshot } from "@/lib/data/memory";
import { createClient } from "@/lib/supabase/server";

function formatConfidence(confidence: number) {
  return `${Math.round(confidence * 100)}%`;
}

export default async function MemoryPage() {
  const supabase = await createClient();
  const context = await getOrganizationContext(supabase);

  if (!context.organization) {
    return null;
  }

  const snapshot = await getMemorySnapshot(supabase, context.organization.id);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.16em] text-zinc-500">
            Memoria operacional
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-50">
            Fatos consolidados
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
            Camada read-only para revisao da memoria que saiu dos perfis
            legados e agora vive no control plane do Supabase.
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Fatos carregados"
          value={String(snapshot.facts.length)}
        />
        <MetricCard
          label="Tipos distintos"
          value={String(snapshot.factTypes.length)}
        />
        <MetricCard
          label="Com agente"
          value={String(snapshot.facts.filter((fact) => fact.agent_id).length)}
        />
        <MetricCard
          label="Supersedidos"
          value={String(
            snapshot.facts.filter((fact) => fact.supersedes_fact_id).length,
          )}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="border-zinc-900 bg-zinc-950">
          <CardHeader>
            <CardTitle className="text-zinc-50">Tipos de fato</CardTitle>
          </CardHeader>
          <CardContent>
            {snapshot.factTypes.length === 0 ? (
              <EmptyState
                title="Sem fatos"
                body="Quando os fatos consolidados forem persistidos em `agent_memory_facts`, a distribuicao aparece aqui."
              />
            ) : (
              <div className="space-y-3">
                {snapshot.factTypes.map((factType) => (
                  <div
                    key={factType.label}
                    className="flex items-center justify-between rounded-md border border-zinc-900 bg-zinc-950/60 px-4 py-3"
                  >
                    <p className="text-sm text-zinc-100">{factType.label}</p>
                    <p className="font-mono text-sm text-zinc-400">
                      {factType.value}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-900 bg-zinc-950">
          <CardHeader>
            <CardTitle className="text-zinc-50">Fatos recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {snapshot.facts.length === 0 ? (
              <EmptyState
                title="Nada para revisar"
                body="A fila de memoria ainda nao gerou fatos suficientes para esta organizacao."
              />
            ) : (
              <div className="overflow-hidden rounded-lg border border-zinc-900">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-900">
                      <TableHead>Assunto</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Agente</TableHead>
                      <TableHead>Confianca</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {snapshot.facts.map((fact) => (
                      <TableRow key={fact.id} className="border-zinc-900">
                        <TableCell className="align-top">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-zinc-100">
                              {fact.subject}
                            </p>
                            <p className="line-clamp-2 max-w-xl text-sm text-zinc-400">
                              {fact.content}
                            </p>
                            <p className="font-mono text-xs text-zinc-500">
                              {format(new Date(fact.created_at), "dd/MM/yyyy HH:mm")}
                              {fact.source_profile
                                ? ` · ${fact.source_profile}`
                                : ""}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{fact.fact_type}</TableCell>
                        <TableCell>{fact.agent_name ?? "Sem agente"}</TableCell>
                        <TableCell>{formatConfidence(fact.confidence)}</TableCell>
                        <TableCell>
                          <StatusBadge status={fact.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
