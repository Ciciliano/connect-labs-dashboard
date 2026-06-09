import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getOrganizationContext } from "@/lib/data/dashboard";
import { getHandoffSnapshot } from "@/lib/data/handoffs";
import { createClient } from "@/lib/supabase/server";

export default async function HandoffsPage() {
  const supabase = await createClient();
  const context = await getOrganizationContext(supabase);

  if (!context.organization) {
    return null;
  }

  const organization = context.organization;
  const snapshot = await getHandoffSnapshot(supabase, organization.id);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm uppercase tracking-[0.16em] text-zinc-500">
          Proatividade
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-50">
          Handoffs e tarefas
        </h1>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-50">Handoffs</h2>
        {snapshot.handoffs.length === 0 ? (
          <EmptyState
            title="Sem handoffs"
            body="Quando o runtime persistir handoffs em `human_handoffs`, eles aparecerao aqui."
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-zinc-900 bg-zinc-950">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-900">
                  <TableHead>Motivo</TableHead>
                  <TableHead>Estrategia</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {snapshot.handoffs.map((handoff) => (
                  <TableRow key={handoff.id} className="border-zinc-900">
                    <TableCell>{handoff.reason}</TableCell>
                    <TableCell>{handoff.resume_strategy}</TableCell>
                    <TableCell>
                      <StatusBadge status={handoff.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-50">Tarefas</h2>
        {snapshot.tasks.length === 0 ? (
          <EmptyState
            title="Sem tarefas pendentes"
            body="As filas do planner e do runner vao aparecer aqui assim que houver registros em `agent_tasks`."
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-zinc-900 bg-zinc-950">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-900">
                  <TableHead>Titulo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Risco</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {snapshot.tasks.map((task) => (
                  <TableRow key={task.id} className="border-zinc-900">
                    <TableCell>{task.title}</TableCell>
                    <TableCell>{task.task_type}</TableCell>
                    <TableCell>{task.risk_level}</TableCell>
                    <TableCell>
                      <StatusBadge status={task.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
