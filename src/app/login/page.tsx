import { redirect } from "next/navigation";

import { LoginForm } from "@/components/login-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isBootstrapEnabled, parseAdminEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  const env = parseAdminEnv();
  const bootstrapEnabled = isBootstrapEnabled();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 py-16">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.1fr_420px]">
        <section className="rounded-lg border border-zinc-900 bg-zinc-950/80 p-8">
          <p className="text-sm uppercase tracking-[0.18em] text-zinc-500">
            Connect Labs
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-zinc-50">
            Hermes Admin
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-zinc-400">
            Painel operacional do Noah, dos agentes e da camada opcional de
            ferramentas. O frontend conversa apenas com o control plane novo do
            Supabase.
          </p>
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-zinc-900 bg-zinc-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                Auth
              </p>
              <p className="mt-2 text-sm text-zinc-200">
                E-mail e senha via Supabase SSR
              </p>
            </div>
            <div className="rounded-md border border-zinc-900 bg-zinc-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                Escopo
              </p>
              <p className="mt-2 text-sm text-zinc-200">
                Agentes, prompts, tools, historico, handoffs e tarefas
              </p>
            </div>
          </div>
        </section>

        <Card className="border-zinc-900 bg-zinc-950">
          <CardHeader>
            <CardTitle className="text-zinc-50">Entrar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {params.bootstrapped ? (
              <p className="text-sm text-emerald-400">
                Admin inicial criado. Agora ja pode entrar.
              </p>
            ) : null}
            {params.error === "membership" ? (
              <p className="text-sm text-amber-400">
                O usuario autenticado ainda nao tem vinculo com a organizacao.
              </p>
            ) : null}
            <LoginForm defaultEmail={env.HERMES_BOOTSTRAP_ADMIN_EMAIL ?? ""} />
            {bootstrapEnabled ? (
              <p className="text-xs leading-6 text-zinc-500">
                Se ainda nao existir nenhum membro na organizacao, use a rota de
                bootstrap para criar o primeiro admin.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
