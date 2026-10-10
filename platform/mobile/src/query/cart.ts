import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { cart } from "@/api/endpoints/cart";
import { type Basket, cartOf, factsBody, type LineFacts, lineOf, seedFacts, settlementOf } from "@/model/cart";
import { useNeeds, useRanged } from "@/query/contract";
import { useCartMarks } from "@/query/marks";
import { useSigned } from "@/query/wire";
import { key } from "@/std/key";

const cartKeys = {
    list: [ "cart" ] as const,
};

export function useCart () {

    const signed = useSigned();

    return useQuery({
        queryKey: cartKeys.list,
        queryFn: async () => cartOf(await cart.list()),
        enabled: signed,
    });

}

export function useCartToggle ( onDenied?: () => void ) {

    const cache = useQueryClient();
    const signed = useSigned();
    const marks = useCartMarks(( state ) => state.marks );
    const needsOf = useNeeds();
    const rangedOf = useRanged();

    const saving = useMutation({
        mutationFn: ({ id, on, capabilities }: { id: number; on: boolean; capabilities: readonly string[] }) => on
            ? cart.add(id, factsBody(seedFacts(needsOf(capabilities), rangedOf(capabilities))), key.attempt("cart-add"))
            : cart.remove(id, key.attempt("cart-remove")),
        onError: ( _error, { id } ) => useCartMarks.getState().unmark(id),
        onSettled: () => {

            cache.invalidateQueries({ queryKey: cartKeys.list });
            cache.invalidateQueries({ queryKey: [ "catalogs" ] });

        },
    });

    const cartedOf = useCallback(
        ( id: number, initial: boolean ) => marks[id] ?? initial,
        [ marks ],
    );

    const toggle = useCallback(( id: number, initial: boolean, capabilities: readonly string[] ) => {

        if ( !signed ) { onDenied?.(); return; }

        const next = !( useCartMarks.getState().marks[id] ?? initial );

        useCartMarks.getState().mark(id, next);
        saving.mutate({ id, on: next, capabilities });

    }, [ onDenied, saving, signed ]);

    return { cartedOf, toggle, pending: saving.isPending };

}

const patched = ( basket: Basket | undefined, id: number, quantity: number ): Basket | undefined =>
    basket ? { ...basket, lines: basket.lines.map(( line ) => line.id === id ? { ...line, quantity } : line ) } : basket;

export function useCartQuantity () {

    const cache = useQueryClient();

    return useMutation({
        mutationFn: ({ id, from, to }: { id: number; from: number; to: number }) => to > from
            ? cart.raise(id, to - from, key.attempt(`cart-raise:${ id }`))
            : cart.lower(id, from - to, key.attempt(`cart-lower:${ id }`)),
        onMutate: ({ id, to }) => {

            const held = cache.getQueryData<Basket>(cartKeys.list);

            cache.setQueryData(cartKeys.list, patched(held, id, to));

            return { held };

        },
        onError: ( _error, _variables, context ) => {

            if ( context?.held ) cache.setQueryData(cartKeys.list, context.held);

        },
        onSettled: () => cache.invalidateQueries({ queryKey: cartKeys.list }),
    });

}

export function useCartAmend () {

    const cache = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, facts }: { id: number; facts: Partial<LineFacts> }) => lineOf(await cart.amend(id, factsBody(facts), key.attempt(`cart-amend:${ id }`))),
        onSuccess: ( line ) => {

            cache.setQueryData(cartKeys.list, ( current: Basket | undefined ) => current
                ? { ...current, lines: current.lines.map(( row ) => row.id === line.id ? line : row ) }
                : current );

        },
        onSettled: () => cache.invalidateQueries({ queryKey: cartKeys.list }),
    });

}

export function useCartDrop () {

    const cache = useQueryClient();

    return useMutation({
        mutationFn: ({ line, catalog }: { line: number; catalog: number }) => {

            useCartMarks.getState().unmark(catalog);

            return cart.drop(line, key.attempt(`cart-drop:${ line }`));

        },
        onSettled: () => {

            cache.invalidateQueries({ queryKey: cartKeys.list });
            cache.invalidateQueries({ queryKey: [ "catalogs" ] });

        },
    });

}

type Settle = {
    lines: readonly number[];
    pay: "wallet" | "later";
    attempt: string;
    code: string | null;
};

export function useCartSettle () {

    const cache = useQueryClient();

    return useMutation({
        mutationFn: async ({ lines, pay, attempt, code }: Settle) =>
            settlementOf(await cart.settle(lines.map(( id ) => ({ id, pay_type: pay }) ), attempt, code)),
        meta: { quiet: true },
        onSettled: () => {

            cache.invalidateQueries({ queryKey: cartKeys.list });
            cache.invalidateQueries({ queryKey: [ "orders" ] });
            cache.invalidateQueries({ queryKey: [ "wallet" ] });

        },
    });

}
