"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  Database,
  MessageSquareText,
  RadioTower,
  Rows3,
  Workflow,
} from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Painel", icon: Rows3 },
  { href: "/agents", label: "Agentes", icon: Bot },
  { href: "/memory", label: "Memoria", icon: Database },
  { href: "/conversations", label: "Historico", icon: MessageSquareText },
  { href: "/tasks", label: "Tarefas", icon: Workflow },
  { href: "/handoffs", label: "Handoffs", icon: RadioTower },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const Icon = item.icon;
        const active =
          item.href === "/"
            ? pathname === item.href
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-zinc-900 text-zinc-50"
                : "text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-100",
            )}
          >
            <Icon className="size-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
