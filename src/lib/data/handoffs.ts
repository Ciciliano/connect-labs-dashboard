import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";

type AppClient = SupabaseClient<Database>;
type HandoffRow = Database["public"]["Tables"]["human_handoffs"]["Row"];
type TaskRow = Database["public"]["Tables"]["agent_tasks"]["Row"];
type TaskRunRow = Database["public"]["Tables"]["agent_task_runs"]["Row"];

export async function getHandoffSnapshot(
  client: AppClient,
  organizationId: string,
) {
  const [handoffsResult, tasksResult, runsResult] = await Promise.all([
    client
      .from("human_handoffs")
      .select("*")
      .eq("organization_id", organizationId)
      .order("opened_at", { ascending: false })
      .limit(20),
    client
      .from("agent_tasks")
      .select("*")
      .eq("organization_id", organizationId)
      .order("due_at", { ascending: true })
      .limit(20),
    client
      .from("agent_task_runs")
      .select("*")
      .eq("organization_id", organizationId)
      .order("started_at", { ascending: false })
      .limit(20),
  ]);

  if (handoffsResult.error) {
    throw handoffsResult.error;
  }

  if (tasksResult.error) {
    throw tasksResult.error;
  }

  if (runsResult.error) {
    throw runsResult.error;
  }

  return {
    handoffs: (handoffsResult.data ?? []) as HandoffRow[],
    tasks: (tasksResult.data ?? []) as TaskRow[],
    runs: (runsResult.data ?? []) as TaskRunRow[],
  };
}
