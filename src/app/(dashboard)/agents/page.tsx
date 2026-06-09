import Link from "next/link";

import { StatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listAgents } from "@/lib/data/agents";
import { getOrganizationContext } from "@/lib/data/dashboard";
import { createClient } from "@/lib/supabase/server";

export default async function AgentsPage() {
  const supabase = await createClient();
  const context = await getOrganizationContext(supabase);

  if (!context.organization) {
    return null;
  }

  const organization = context.organization;
  const agents = await listAgents(supabase, organization.id);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-[0.16em] text-zinc-500">
          Controle
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-50">Agentes</h1>
      </header>

      <div className="overflow-hidden rounded-lg border border-zinc-900 bg-zinc-950">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-900">
              <TableHead>Agente</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Role</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents.map((agent) => (
              <TableRow key={agent.id} className="border-zinc-900">
                <TableCell>
                  <div>
                    <p className="font-medium text-zinc-100">{agent.name}</p>
                    <p className="text-sm text-zinc-400">{agent.slug}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={agent.status} />
                </TableCell>
                <TableCell className="text-zinc-300">{agent.plan}</TableCell>
                <TableCell className="text-zinc-300">{agent.model_tier}</TableCell>
                <TableCell className="text-zinc-300">{agent.role}</TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/agents/${agent.id}`}
                    className="text-sm font-medium text-emerald-300"
                  >
                    Abrir
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
