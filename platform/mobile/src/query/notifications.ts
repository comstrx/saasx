import { type InfiniteData, type QueryClient, type QueryKey, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type AlertMark, notifications } from "@/api/endpoints/notifications";
import { type Alert, alertsOf, boardOf } from "@/model/notification";
import { nextPage } from "@/query/shelf";
import { useSigned } from "@/query/wire";
import { key } from "@/std/key";

const alertKeys = {
    boards: [ "notifications", "board" ] as const,
    board: ( kinds: readonly string[] ) => [ "notifications", "board", kinds.join(",") ] as const,
    stats: [ "notifications", "stats" ] as const,
};

type Boards = InfiniteData<ReturnType<typeof boardOf>>;
type Held = readonly ( readonly [ QueryKey, Boards | undefined ] )[];

const marks: Readonly<Record<AlertMark, Partial<Alert>>> = {
    read: { read: true },
    unread: { read: false },
    pin: { pinned: true },
    unpin: { pinned: false },
};

const reshape = async ( cache: QueryClient, touched: ReadonlySet<number>, edit: ( alert: Alert ) => Alert | null ): Promise<Held> => {

    await cache.cancelQueries({ queryKey: alertKeys.boards });

    const held = cache.getQueriesData<Boards>({ queryKey: alertKeys.boards });

    cache.setQueriesData<Boards>({ queryKey: alertKeys.boards }, ( data ) => data && {
        ...data,
        pages: data.pages.map(( page ) => ({
            ...page,
            items: page.items.flatMap(( alert ) => {

                const next = touched.has(alert.id) ? edit(alert) : alert;

                return next ? [ next ] : [];

            }),
        })),
    });

    return held;

};

const restore = ( cache: QueryClient, held: Held | undefined ) => {

    for ( const [ board, data ] of held ?? [] ) cache.setQueryData(board, data);

};

const touchedBy = ( target: number | readonly number[] | undefined ): ReadonlySet<number> =>
    new Set(typeof target === "number" ? [ target ] : target ?? []);

export function useAlerts ( kinds: readonly string[] = [] ) {

    const signed = useSigned();

    return useInfiniteQuery({
        queryKey: alertKeys.board(kinds),
        queryFn: async ({ pageParam }) => boardOf(await notifications.board(kinds, pageParam)),
        initialPageParam: 1,
        getNextPageParam: nextPage,
        enabled: signed,
    });

}

export function useAlertCount () {

    const signed = useSigned();

    return useQuery({
        queryKey: alertKeys.stats,
        queryFn: async () => alertsOf(await notifications.stats()),
        enabled: signed,
    });

}

export function useAlertRefresh () {

    const cache = useQueryClient();

    return () => { cache.invalidateQueries({ queryKey: [ "notifications" ] }); };

}

export function useMarkAlert () {

    const cache = useQueryClient();
    const settle = useAlertRefresh();

    return useMutation({
        mutationFn: ({ id, ids, action }: { id?: number; ids?: readonly number[]; action: AlertMark }) => id !== undefined
            ? notifications.mark(id, action, key.attempt(`alert-${ action }:${ id }`))
            : notifications.markAll(ids ?? [], action, key.attempt(`alerts-${ action }`)),
        onMutate: async ({ id, ids, action }) => ({ held: await reshape(cache, touchedBy(id ?? ids), ( alert ) => ({ ...alert, ...marks[action] }) ) }),
        onError: ( _error, _input, context ) => restore(cache, context?.held),
        onSettled: settle,
    });

}

export function useDropAlert () {

    const cache = useQueryClient();
    const settle = useAlertRefresh();

    return useMutation({
        mutationFn: ( target: number | readonly number[] ) => typeof target === "number"
            ? notifications.drop(target, key.attempt(`alert-drop:${ target }`))
            : notifications.dropAll(target, key.attempt("alerts-drop")),
        onMutate: async ( target ) => ({ held: await reshape(cache, touchedBy(target), () => null ) }),
        onError: ( _error, _target, context ) => restore(cache, context?.held),
        onSettled: settle,
    });

}
