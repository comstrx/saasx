import { z } from "zod";
import { call } from "@/api/client";

const row = z.object({
    id: z.number(),
    name: z.string().nullable().optional(),
    agent: z.string().nullable().optional(),
    ip: z.string().nullable().optional(),
    is_me: z.boolean().nullable().optional(),
    created_at: z.string().nullable().optional(),
    last_used_at: z.string().nullable().optional(),
    expires_at: z.string().nullable().optional(),
});

const listed = z.object({ items: z.array(row) });

export type SessionRow = z.infer<typeof row>;

export const sessions = {

    list: async (): Promise<readonly SessionRow[]> => ( await call({ path: "tokens?limit=50", schema: listed }) ).items,

    revoke: ( id: number, attempt: string ) =>
        call({ path: `tokens/${ id }`, method: "DELETE", idempotencyKey: attempt }),

    revokeOthers: ( attempt: string ) =>
        call({ path: "tokens/others", method: "DELETE", idempotencyKey: attempt }),

};
