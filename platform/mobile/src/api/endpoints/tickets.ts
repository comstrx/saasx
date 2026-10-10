import { z } from "zod";
import { call, page } from "@/api/client";
import { maybeObject } from "@/api/contracts";

const person = z.object({
    id: z.number(),
    name: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
});

const linkedOrder = z.object({
    id: z.number(),
    reference: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
});

const reply = z.object({
    id: z.number(),
    content: z.string().nullable().optional(),
    created_at: z.string().nullable().optional(),
    user: maybeObject(person),
});

const row = z.object({
    id: z.number(),
    title: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    classification: z.string().nullable().optional(),
    created_at: z.string().nullable().optional(),
    updated_at: z.string().nullable().optional(),
    resolved_at: z.string().nullable().optional(),
    closed_at: z.string().nullable().optional(),
    reopened_at: z.string().nullable().optional(),
    user: maybeObject(person),
    order: maybeObject(linkedOrder),
    replies: z.array(reply).nullable().optional(),
});

const rows = z.array(row);

export type TicketRow = z.infer<typeof row>;

export type ReplyRow = z.infer<typeof reply>;

export type TicketMove = "resolve" | "close" | "reopen";

export type TicketDraft = {
    title: string;
    content: string;
    order?: number | undefined;
};

export const tickets = {

    list: ( status?: string, at = 1 ) =>
        page({ path: `tickets?limit=20${ status ? `&filters[status]=${ status }` : "" }`, schema: rows }, at),

    show: ( id: number ): Promise<TicketRow> => call({ path: `tickets/${ id }`, schema: row }),

    open: ( draft: TicketDraft, attempt: string ): Promise<TicketRow> =>
        call({
            path: draft.order ? `orders/${ draft.order }/ticket` : "tickets",
            method: "POST",
            body: { title: draft.title, content: draft.content },
            schema: row,
            idempotencyKey: attempt,
        }),

    reply: ( id: number, content: string, attempt: string ) =>
        call({ path: `tickets/${ id }/reply`, method: "POST", body: { content }, idempotencyKey: attempt }),

    move: ( id: number, action: TicketMove, attempt: string ) =>
        call({ path: `tickets/${ id }/${ action }`, method: "POST", idempotencyKey: attempt }),

};
