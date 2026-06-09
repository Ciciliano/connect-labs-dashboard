import { Badge } from "@/components/ui/badge";

const toneByStatus: Record<string, string> = {
  active: "bg-emerald-500/14 text-emerald-300 border-emerald-500/30",
  paused: "bg-amber-500/14 text-amber-300 border-amber-500/30",
  archived: "bg-zinc-500/14 text-zinc-300 border-zinc-500/30",
  draft: "bg-cyan-500/14 text-cyan-300 border-cyan-500/30",
  open: "bg-amber-500/14 text-amber-300 border-amber-500/30",
  closed: "bg-zinc-500/14 text-zinc-300 border-zinc-500/30",
  pending: "bg-cyan-500/14 text-cyan-300 border-cyan-500/30",
  approved: "bg-emerald-500/14 text-emerald-300 border-emerald-500/30",
  failed: "bg-rose-500/14 text-rose-300 border-rose-500/30",
  shadow: "bg-violet-500/14 text-violet-300 border-violet-500/30",
};

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  return (
    <Badge
      variant="outline"
      className={toneByStatus[normalized] ?? "border-zinc-700 text-zinc-300"}
    >
      {status}
    </Badge>
  );
}
