import { z } from "zod";
import { env } from "@/lib/env";

const healthResponseSchema = z.object({ status: z.string() });

export type HealthStatus = "ok" | "degraded" | "unreachable";

// Network failures reject (TanStack Query error state = "unreachable");
// any reachable-but-wrong response is "degraded".
export async function fetchHealth({
    signal,
}: {
    signal?: AbortSignal;
} = {}): Promise<Exclude<HealthStatus, "unreachable">> {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/health`, {
        signal,
        cache: "no-store",
    });
    if (!res.ok) return "degraded";
    const body = await res.json().catch(() => null);
    const parsed = healthResponseSchema.safeParse(body);
    return parsed.success && parsed.data.status === "ok" ? "ok" : "degraded";
}
