import { media } from "@/api/client";
import { oneOf } from "@/api/contracts";
import type { ReplyRow, TicketMove, TicketRow } from "@/api/endpoints/tickets";

export type TicketStatus = "pending" | "resolved" | "closed";

export type TicketAuthor = {
    id: number;
    name: string;
    image: string | null;
};

export type TicketReply = {
    id: number;
    content: string;
    createdAt: string | null;
    author: TicketAuthor | null;
};

type TicketOrder = {
    id: number;
    reference: string;
    status: string;
};

export type Ticket = {
    id: number;
    title: string;
    content: string;
    status: TicketStatus;
    classification: string;
    createdAt: string | null;
    updatedAt: string | null;
    resolvedAt: string | null;
    closedAt: string | null;
    reopenedAt: string | null;
    author: TicketAuthor | null;
    order: TicketOrder | null;
    replies: readonly TicketReply[];
};

export type TicketAction = TicketMove;

export const ticketStatuses: readonly TicketStatus[] = [ "pending", "resolved", "closed" ];

export const open = ( ticket: Ticket ): boolean => ticket.status === "pending";

const statusOf = ( value: string | null | undefined ): TicketStatus =>
    ticketStatuses.find(( status ) => status === value ) ?? "pending";

const authorOf = ( value: TicketRow["user"] ): TicketAuthor | null => {

    const entry = oneOf(value);

    if ( !entry ) return null;

    return { id: entry.id, name: entry.name ?? "", image: media(entry.image) };

};

const replyOf = ( entry: ReplyRow ): TicketReply => ({
    id: entry.id,
    content: entry.content ?? "",
    createdAt: entry.created_at ?? null,
    author: authorOf(entry.user),
});

export const ticketOf = ( entry: TicketRow ): Ticket => {

    const order = oneOf(entry.order);

    return {
        id: entry.id,
        title: entry.title ?? "",
        content: entry.content ?? "",
        status: statusOf(entry.status),
        classification: entry.classification ?? "",
        createdAt: entry.created_at ?? null,
        updatedAt: entry.updated_at ?? null,
        resolvedAt: entry.resolved_at ?? null,
        closedAt: entry.closed_at ?? null,
        reopenedAt: entry.reopened_at ?? null,
        author: authorOf(entry.user),
        order: order ? { id: order.id, reference: order.reference ?? "", status: order.status ?? "" } : null,
        replies: ( entry.replies ?? [] ).map(replyOf),
    };

};
