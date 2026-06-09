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
import { getTaskSnapshot } from "@/lib/data/tasks";
import { createClient } from "@/lib/supabase/server";

function formatDateTime(value: string | null) {
  if (!value) {
    return "-";
  }

  return format(new Date(value), "dd/MM/yyyy HH:mm");
}

export default async function TasksPage() {
  const supabase = await createClient();
  const context = await getOrganizationContext(supabase);

  if (!context.organization) {
    return null;
  }

  const snapshot = await getTaskSnapshot(supabase, context.organization.id);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm uppercase tracking-[0.16em] text-zinc-500">
          Proatividade
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-50">
          Tarefas e execucoes
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
          Leitura operacional da fila do planner e do runner antes de liberar
          scheduler autonomo em producao.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Aguardando aprovacao"
          value={String(snapshot.attention.awaitingApproval.length)}
        />
        <MetricCard
          label="Falhas"
          value={String(snapshot.attention.failed.length)}
        />
        <MetricCard
          label="Na fila"
          value={String(snapshot.attention.upNext.length)}
        />
        <MetricCard
          label="Execucoes recentes"
          value={String(snapshot.runs.length)}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-zinc-900 bg-zinc-950">
          <CardHeader>
            <CardTitle className="text-zinc-50">Fila de tarefas</CardTitle>
          </CardHeader>
          <CardContent>
            {snapshot.tasks.length === 0 ? (
              <EmptyState
                title="Sem tarefas"
                body="Quando `agent_tasks` receber registros do planner ou do runner, a fila aparece aqui."
              />
            ) : (
              <div className="overflow-hidden rounded-lg border border-zinc-900">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-900">
                      <TableHead>Titulo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Risco</TableHead>
                      <TableHead>Vence em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {snapshot.tasks.map((task) => (
                      <TableRow key={task.id} className="border-zinc-900">
                        <TableCell className="align-top">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-zinc-100">
                              {task.title}
                            </p>
                            <p className="text-sm text-zinc-400">
                              {task.task_type}
                              {task.requires_approval
                                ? " · exige aprovacao"
                                : ""}
                            </p>
                            {task.last_error ? (
                              <p className="text-xs text-rose-400">
                                {task.last_error}
                              </p>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={task.status} />
                        </TableCell>
                        <TableCell>{task.risk_level}</TableCell>
                        <TableCell>{formatDateTime(task.due_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-900 bg-zinc-950">
          <CardHeader>
            <CardTitle className="text-zinc-50">Execucoes recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {snapshot.runs.length === 0 ? (
              <EmptyState
                title="Sem execucoes"
                body="Os registros de `agent_task_runs` vao aparecer aqui quando o runner estiver operando."
              />
            ) : (
              <div className="space-y-3">
                {snapshot.runs.map((run) => (
                  <div
                    key={run.id}
                    className="rounded-md border border-zinc-900 bg-zinc-950/60 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-mono text-xs text-zinc-500">
                        {run.task_id}
                      </p>
                      <StatusBadge status={run.status} />
                    </div>
                    <p className="mt-3 text-sm text-zinc-300">
                      Inicio {formatDateTime(run.started_at)}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">
                      Fim {formatDateTime(run.finished_at)}
                    </p>
                    {run.error ? (
                      <p className="mt-3 text-sm text-rose-400">{run.error}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
