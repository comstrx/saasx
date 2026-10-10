import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { detail, favorites } from "@/api/endpoints/catalogs";
import { savedOf } from "@/model/catalog";
import { shelve } from "@/model/shelf";
import { useFavoriteMarks } from "@/query/marks";
import { nextPage } from "@/query/shelf";
import { useSigned } from "@/query/wire";
import { key } from "@/std/key";

const favoriteKeys = {
    list: [ "favorites" ] as const,
};

export function useFavorites () {

    const signed = useSigned();

    return useInfiniteQuery({
        queryKey: favoriteKeys.list,
        queryFn: async ({ pageParam }) => shelve(await favorites.list(pageParam), savedOf),
        initialPageParam: 1,
        getNextPageParam: nextPage,
        enabled: signed,
    });

}

export function useFavoriteToggle ( onDenied?: () => void ) {

    const cache = useQueryClient();
    const signed = useSigned();
    const marks = useFavoriteMarks(( state ) => state.marks );

    const saving = useMutation({
        mutationFn: ({ id, on }: { id: number; on: boolean }) => detail.favorite(id, on, key.attempt("favorite")),
        onError: ( _error, { id } ) => useFavoriteMarks.getState().unmark(id),
        onSettled: () => {

            cache.invalidateQueries({ queryKey: favoriteKeys.list });
            cache.invalidateQueries({ queryKey: [ "catalogs" ] });

        },
    });

    const favoriteOf = useCallback(
        ( id: number, initial: boolean ) => marks[id] ?? initial,
        [ marks ],
    );

    const toggle = useCallback(( id: number, initial: boolean ) => {

        if ( !signed ) { onDenied?.(); return; }

        const next = !( useFavoriteMarks.getState().marks[id] ?? initial );

        useFavoriteMarks.getState().mark(id, next);
        saving.mutate({ id, on: next });

    }, [ onDenied, saving, signed ]);

    return { favoriteOf, toggle };

}
