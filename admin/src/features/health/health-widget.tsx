"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { HealthStatus } from "./api";
import { useHealth } from "./use-health";

const STATUS: Record<HealthStatus, { label: string; dot: string }> = {
  ok: { label: "ok", dot: "bg-emerald-500" },
  degraded: { label: "degraded", dot: "bg-amber-500" },
  unreachable: { label: "unreachable", dot: "bg-red-500" },
};

export function HealthWidget() {
  const { data, isPending, isError } = useHealth();

  if (isPending) {
    return <Skeleton className="h-7 w-36 rounded-full" />;
  }

  const status: HealthStatus = isError ? "unreachable" : data;
  const { label, dot } = STATUS[status];

  return (
    <output className="flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-muted-foreground">
      <span aria-hidden className={cn("size-2 rounded-full", dot)} />
      API {label}
    </output>
  );
}
