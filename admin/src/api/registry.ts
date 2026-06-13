import { z } from "zod";
import type { ApiEntry } from "@/api/client";

const health = {
    resource: "system",
    action: "health",
    method: "GET",
    path: "/health",
    bare: true,
    guest: true,
    schema: z.object({ status: z.string() }),
} satisfies ApiEntry<{ status: string }>;

const permissions = {
    resource: "auth",
    action: "permissions",
    method: "GET",
    path: "/auth/permissions",
    schema: z.array(z.string()),
} satisfies ApiEntry<string[]>;

export const api = {

    health,
    permissions,

} as const;
