import Link from "next/link";
import { redirect } from "next/navigation";

import { AppNav } from "@/components/app-nav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getOrganizationContext } from "@/lib/data/dashboard";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/(dashboard)/actions";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const context = await getOrganizationContext(supabase);

  if (context.gate === "bootstrap") {
    redirect("/bootstrap");
  }

  if (context.gate === "blocked" || !context.organization || !context.membership) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
        <Card className="max-w-lg border-zinc-900 bg-zinc-950 p-8">
          <h1 className="text-xl font-semibold text-zinc-50">
            Sem vinculo com a organizacao
          </h1>
          <p className="mt-4 text-sm leading-7 text-zinc-400">
            O usuario autenticado nao esta vinculado a nenhuma organizacao do
            Hermes Admin. Ative o bootstrap inicial ou anexe este usuario em
            `organization_members`.
          </p>
          <Button asChild className="mt-6">
            <Link href="/login?error=membership">Voltar ao login</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="border-r border-zinc-900 px-4 py-5">
          <Link href="/" className="block rounded-md px-3 py-2">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Connect Labs
            </p>
            <p className="mt-2 text-lg font-semibold text-zinc-50">
              Hermes Admin
            </p>
            <p className="mt-1 text-sm text-zinc-400">{context.organization.name}</p>
          </Link>
          <div className="mt-6">
            <AppNav />
          </div>
          <form action={signOutAction} className="mt-8">
            <Button
              type="submit"
              variant="outline"
              className="w-full border-zinc-800 bg-transparent text-zinc-200 hover:bg-zinc-900"
            >
              Sair
            </Button>
          </form>
        </aside>
        <main className="min-w-0 px-6 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
