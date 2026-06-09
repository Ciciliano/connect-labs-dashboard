import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";

type AppClient = SupabaseClient<Database>;
type TaskRow = Database["public"]["Tables"]["agent_tasks"]["Row"];
type TaskRunRow = Database["public"]["Tables"]["agent_task_runs"]["Row"];

export type AttentionBuckets = {
  awaitingApproval: TaskRow[];
  failed: TaskRow[];
  recent: TaskRow[];
  upNext: TaskRow[];
};

export function splitTasksByAttention(tasks: TaskRow[]): AttentionBuckets {
  return tasks.reduce<AttentionBuckets>(
    (buckets, task) => {
      if (task.status === "failed") {
        buckets.failed.push(task);
        return buckets;
      }

      if (task.requires_approval && task.status === "pending") {
        buckets.awaitingApproval.push(task);
        return buckets;
      }

      if (task.status === "approved" || task.status === "running") {
        buckets.upNext.push(task);
        return buckets;
      }

      buckets.recent.push(task);
      return buckets;
    },
    {
      awaitingApproval: [],
      failed: [],
      recent: [],
      upNext: [],
    },
  );
}

export async function getTaskSnapshot(
  client: AppClient,
  organizationId: string,
) {
  const [tasksResult, runsResult] = await Promise.all([
    client
      .from("agent_tasks")
      .select("*")
      .eq("organization_id", organizationId)
      .order("due_at", { ascending: true })
      .limit(50),
    client
      .from("agent_task_runs")
      .select("*")
      .eq("organization_id", organizationId)
      .order("started_at", { ascending: false })
      .limit(20),
  ]);

  if (tasksResult.error) {
    throw tasksResult.error;
  }

  if (runsResult.error) {
    throw runsResult.error;
  }

  const tasks = (tasksResult.data ?? []) as TaskRow[];

  return {
    tasks,
    runs: (runsResult.data ?? []) as TaskRunRow[],
    attention: splitTasksByAttention(tasks),
  };
}
