import { redirect } from "next/navigation";

import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isBootstrapEnabled, parseAdminEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { bootstrapAdminAction } from "@/app/bootstrap/actions";

export const dynamic = "force-dynamic";

export default async function BootstrapPage() {
  const bootstrapEnabled = isBootstrapEnabled();

  if (!bootstrapEnabled) {
    redirect("/login");
  }

  const env = parseAdminEnv();
  const admin = createAdminClient();
  const { data: organization } = await admin
    .from("organizations")
    .select("id, name, slug")
    .eq("slug", env.HERMES_BOOTSTRAP_ORGANIZATION_SLUG)
    .single();

  if (!organization) {
    redirect("/login?error=bootstrap-org");
  }

  const { count } = await admin
    .from("organization_members")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organization.id);

  if ((count ?? 0) > 0) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 py-16">
      <Card className="w-full max-w-xl border-zinc-900 bg-zinc-950">
        <CardHeader>
          <CardTitle className="text-zinc-50">Bootstrap do admin inicial</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm leading-7 text-zinc-400">
            Esta etapa cria o primeiro usuario administrador e o vincula a
            organizacao alvo no Supabase. Depois disso, o login normal assume.
          </p>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-md border border-zinc-900 bg-zinc-950/70 p-4">
              <dt className="text-zinc-500">Organizacao</dt>
              <dd className="mt-1 text-zinc-100">{organization.name}</dd>
            </div>
            <div className="rounded-md border border-zinc-900 bg-zinc-950/70 p-4">
              <dt className="text-zinc-500">Admin inicial</dt>
              <dd className="mt-1 text-zinc-100">
                {env.HERMES_BOOTSTRAP_ADMIN_EMAIL ?? "nao configurado"}
              </dd>
            </div>
          </dl>
          <form action={bootstrapAdminAction}>
            <SubmitButton>Criar admin inicial</SubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
