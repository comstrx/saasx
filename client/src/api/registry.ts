import { z } from "zod";
import type { ApiEntry } from "./resource";

const health: ApiEntry<{ status: string }> = {
    resource: "health",
    action: "show",
    method: "GET",
    path: "/health",
    schema: z.object({ status: z.string() }),
    bare: true,
};

export const api = { health };
