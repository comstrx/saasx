import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type TicketDraft, tickets } from "@/api/endpoints/tickets";
import { shelve } from "@/model/shelf";
import { type TicketAction, type TicketStatus, ticketOf } from "@/model/ticket";
import { nextPage } from "@/query/shelf";
import { useSigned } from "@/query/wire";
import { key } from "@/std/key";

const ticketKeys = {
    all: [ "tickets" ] as const,
    list: ( status: TicketStatus | "all" ) => [ "tickets", "list", status ] as const,
    one: ( id: number ) => [ "tickets", "one", id ] as const,
};

export function useTickets ( status: TicketStatus | "all" ) {

    const signed = useSigned();

    return useInfiniteQuery({
        queryKey: ticketKeys.list(status),
        queryFn: async ({ pageParam }) => shelve(await tickets.list(status === "all" ? undefined : status, pageParam), ( rows ) => rows.map(ticketOf)),
        initialPageParam: 1,
        getNextPageParam: nextPage,
        enabled: signed,
    });

}

export function useTicket ( id: number ) {

    const signed = useSigned();

    return useQuery({
        queryKey: ticketKeys.one(id),
        queryFn: async () => ticketOf(await tickets.show(id)),
        enabled: signed && id > 0,
    });

}

export function useOpenTicket () {

    const cache = useQueryClient();

    return useMutation({
        mutationFn: async ( draft: TicketDraft ) => ticketOf(await tickets.open(draft, key.attempt("ticket-open"))),
        onSuccess: () => { cache.invalidateQueries({ queryKey: ticketKeys.all }); },
    });

}

export function useReplyTicket ( id: number ) {

    const cache = useQueryClient();

    return useMutation({
        mutationFn: ( content: string ) => tickets.reply(id, content, key.attempt("ticket-reply")),
        onSuccess: () => { cache.invalidateQueries({ queryKey: ticketKeys.all }); },
    });

}

export function useMoveTicket ( id: number ) {

    const cache = useQueryClient();

    return useMutation({
        mutationFn: ( action: TicketAction ) => tickets.move(id, action, key.attempt(`ticket-${ action }`)),
        onSuccess: () => { cache.invalidateQueries({ queryKey: ticketKeys.all }); },
    });

}
