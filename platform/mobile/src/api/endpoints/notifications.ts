import { z } from "zod";
import { call, type Page, page } from "@/api/client";
import { maybeObject, oneOf } from "@/api/contracts";

const row = z.object({
    id: z.number(),
    kind: z.string().nullable().optional(),
    type: z.string().nullable().optional(),
    channel: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
    image_variants: maybeObject(z.record(z.string(), z.string().nullable())),
    read: z.boolean().nullable().optional(),
    pinned: z.boolean().nullable().optional(),
    send_at: z.string().nullable().optional(),
    created_at: z.string().nullable().optional(),
});

const rows = z.array(row);

const counts = z.object({
    count: z.number().nullable().optional(),
    unread: z.number().nullable().optional(),
    pinned: z.number().nullable().optional(),
});

const census = z.object({
    facets: z.object({ kind: maybeObject(z.record(z.string(), z.number())) }).nullable().optional(),
});

export type AlertRow = z.infer<typeof row>;

export type AlertCounts = z.infer<typeof counts>;

export type AlertPage = Page<readonly AlertRow[]> & {
    kinds: Readonly<Record<string, number>>;
};

export type AlertMark = "read" | "unread" | "pin" | "unpin";

const query = ( limit: number, kinds: readonly string[] ) => {

    const parts = [ `limit=${ limit }`, "facets=kind" ];

    if ( kinds.length > 0 ) parts.push(`filters[kind]=${ encodeURIComponent(kinds.join(",")) }`);

    return parts.join("&");

};

export const notifications = {

    board: async ( kinds: readonly string[] = [], at = 1, limit = 20 ): Promise<AlertPage> => {

        const answer = await page({ path: `notifications?${ query(limit, kinds) }`, schema: rows }, at);
        const read = census.safeParse(answer.meta);

        return { ...answer, kinds: oneOf(read.success ? read.data.facets?.kind : null) ?? {} };

    },

    stats: (): Promise<AlertCounts> => call({ path: "notifications/stats", schema: counts }),

    mark: ( id: number, action: AlertMark, attempt: string ) =>
        call({ path: `notifications/${ id }/${ action }`, method: "POST", idempotencyKey: attempt }),

    markAll: ( ids: readonly number[], action: AlertMark, attempt: string ) =>
        call({ path: `notifications/${ action }`, method: "POST", body: { all: true, ids }, idempotencyKey: attempt }),

    drop: ( id: number, attempt: string ) =>
        call({ path: `notifications/${ id }`, method: "DELETE", idempotencyKey: attempt }),

    dropAll: ( ids: readonly number[], attempt: string ) =>
        call({ path: "notifications", method: "DELETE", body: { all: true, ids }, idempotencyKey: attempt }),

};
