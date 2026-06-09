"use server";

import { redirect } from "next/navigation";

import { normalizeEmail } from "@/lib/auth";
import { parseAdminEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

export async function bootstrapAdminAction() {
  const env = parseAdminEnv();

  if (env.HERMES_ADMIN_BOOTSTRAP_ENABLED !== "true") {
    redirect("/login");
  }

  if (!env.HERMES_BOOTSTRAP_ADMIN_EMAIL || !env.HERMES_BOOTSTRAP_ADMIN_PASSWORD) {
    redirect("/login?error=bootstrap-config");
  }

  const admin = createAdminClient();
  const normalizedEmail = normalizeEmail(env.HERMES_BOOTSTRAP_ADMIN_EMAIL);

  const { data: organization, error: organizationError } = await admin
    .from("organizations")
    .select("id, slug, name")
    .eq("slug", env.HERMES_BOOTSTRAP_ORGANIZATION_SLUG)
    .single();

  if (organizationError || !organization) {
    redirect("/login?error=bootstrap-org");
  }

  const { count, error: countError } = await admin
    .from("organization_members")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organization.id);

  if (countError) {
    redirect("/login?error=bootstrap-membership");
  }

  if ((count ?? 0) > 0) {
    redirect("/login");
  }

  const { data: usersData, error: usersError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });

  if (usersError) {
    redirect("/login?error=bootstrap-users");
  }

  let userId =
    usersData.users.find((user) => normalizeEmail(user.email ?? "") === normalizedEmail)
      ?.id ?? null;

  if (!userId) {
    const { data: created, error: createUserError } =
      await admin.auth.admin.createUser({
        email: normalizedEmail,
        password: env.HERMES_BOOTSTRAP_ADMIN_PASSWORD,
        email_confirm: true,
      });

    if (createUserError || !created.user) {
      redirect("/login?error=bootstrap-create");
    }

    userId = created.user.id;
  }

  const { error: membershipError } = await admin
    .from("organization_members")
    .upsert(
      {
        organization_id: organization.id,
        user_id: userId,
        role: "owner",
      },
      { onConflict: "organization_id,user_id" },
    );

  if (membershipError) {
    redirect("/login?error=bootstrap-attach");
  }

  redirect("/login?bootstrapped=1");
}
