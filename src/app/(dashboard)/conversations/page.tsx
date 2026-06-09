import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listRecentConversations } from "@/lib/data/conversations";
import { getOrganizationContext } from "@/lib/data/dashboard";
import { createClient } from "@/lib/supabase/server";

export default async function ConversationsPage() {
  const supabase = await createClient();
  const context = await getOrganizationContext(supabase);

  if (!context.organization) {
    return null;
  }

  const organization = context.organization;
  const rows = await listRecentConversations(supabase, organization.id);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-[0.16em] text-zinc-500">
          Read only
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-50">
          Historico de conversas
        </h1>
      </header>

      {rows.length === 0 ? (
        <EmptyState
          title="Ainda nao ha conversas no control plane novo"
          body="A pagina esta pronta e segura, mas as conversas novas ainda nao foram materializadas nas tabelas canonicas."
        />
      ) : (
        <div className="space-y-4">
          {rows.map(({ conversation, messages }) => (
            <Card key={conversation.id} className="border-zinc-900 bg-zinc-950">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-zinc-50">
                    {conversation.channel} · {conversation.conversation_id}
                  </CardTitle>
                  <p className="mt-2 text-sm text-zinc-400">
                    {conversation.summary ?? conversation.last_message ?? "Sem resumo"}
                  </p>
                </div>
                <StatusBadge status={conversation.status} />
              </CardHeader>
              <CardContent className="space-y-3">
                {messages.slice(0, 6).map((message) => (
                  <div
                    key={message.id}
                    className="rounded-md border border-zinc-900 bg-zinc-950/60 px-4 py-3"
                  >
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                      {message.role} · {message.direction}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-zinc-300">
                      {message.content ?? "Sem conteudo textual"}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
