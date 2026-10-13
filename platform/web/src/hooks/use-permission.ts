"use client";

import { allowed, missing } from "@engine/api";
import type { CompiledPort } from "@engine/spec";
import { useSession } from "@/hooks/use-session";

export type Permission = { allowed: boolean; missing: readonly string[]; ready: boolean };

export function usePermission ( port: CompiledPort | undefined ): Permission {
    const { ready, user } = useSession();
    const needed = port?.kind === "write" ? port.permissions : [];

    return { ready, allowed: allowed(user, needed), missing: missing(user, needed) };
}
