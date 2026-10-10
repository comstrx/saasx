import { useInfiniteQuery, useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { type OrderReview, orders } from "@/api/endpoints/orders";
import { type CheckoutBasket, orderBody } from "@/model/checkout";
import { wireAmount } from "@/model/currency";
import { reviewOf } from "@/model/detail";
import { orderOf, type PayType, quoteOf } from "@/model/order";
import { intentOf, settleTick } from "@/model/payment";
import { shelve } from "@/model/shelf";
import { nextPage } from "@/query/shelf";
import { useCurrency, useSigned } from "@/query/wire";
import { key } from "@/std/key";

const orderKeys = {
    shelf: [ "orders", "shelf" ] as const,
    show: ( id: number ) => [ "orders", "show", id ] as const,
    preview: ( currency: string, basket: CheckoutBasket ) => [ "orders", "preview", currency, basket ] as const,
};

type Checkout = {
    basket: CheckoutBasket;
    pay: PayType;
    token: string;
    gateway: number | null;
    amount: number;
    currency: string;
    attempt: string;
    code: string | null;
};

type Payment = {
    gateway: number | null;
    attempt: string;
    code: string | null;
};

const quoting = ( basket: CheckoutBasket ) => async () => quoteOf(await orders.preview(orderBody(basket), key.attempt("preview")));

export function useOrders () {

    const signed = useSigned();

    return useInfiniteQuery({
        queryKey: orderKeys.shelf,
        queryFn: async ({ pageParam }) => shelve(await orders.page(pageParam), ( rows ) => rows.map(orderOf)),
        initialPageParam: 1,
        getNextPageParam: nextPage,
        enabled: signed,
    });

}

export function useOrderReviews ( id: number, on: boolean ) {

    return useQuery({
        queryKey: [ "orders", "reviews", id ] as const,
        queryFn: async () => ( await orders.reviews(id) ).map(reviewOf),
        enabled: id > 0 && on,
    });

}

export function useOrder ( id: number, awaiting = false ) {

    return useQuery({
        queryKey: orderKeys.show(id),
        queryFn: async () => orderOf(await orders.show(id)),
        enabled: id > 0,
        refetchInterval: ( query ) => {

            const order = query.state.data;

            return awaiting && order && !order.paid && order.canPay ? settleTick : false;

        },
    });

}

export function usePreview ( basket: CheckoutBasket, enabled = true ) {

    const currency = useCurrency();

    return useQuery({
        queryKey: orderKeys.preview(currency, basket),
        queryFn: quoting(basket),
        placeholderData: ( previous, query ) => {

            const prior = query?.queryKey[3];
            const same = query?.queryKey[2] === currency && typeof prior === "object" && prior !== null && "catalog" in prior && prior.catalog === basket.catalog;

            return same ? previous : undefined;

        },
        enabled: enabled && basket.catalog > 0,
        staleTime: 0,
        gcTime: 0,
    });

}

export function useQuotes ( baskets: readonly CheckoutBasket[], enabled = true ) {

    const currency = useCurrency();

    return useQueries({
        queries: baskets.map(( basket ) => ({
            queryKey: orderKeys.preview(currency, basket),
            queryFn: quoting(basket),
            enabled: enabled && basket.catalog > 0,
            staleTime: 0,
            gcTime: 0,
        })),
    });

}

export function useCheckout () {

    const cache = useQueryClient();

    return useMutation({
        mutationFn: async ({ basket, pay, token, gateway, amount, currency, attempt, code }: Checkout) => {

            const placed = await orders.checkout(orderBody(basket), pay, token, gateway, wireAmount(amount, currency), attempt, code);

            return intentOf(placed.payment, placed.order.id);

        },
        meta: { quiet: true },
        onSettled: () => {

            cache.invalidateQueries({ queryKey: [ "orders" ] });
            cache.invalidateQueries({ queryKey: [ "wallet" ] });

        },
    });

}

export function usePayOrder ( id: number ) {

    const cache = useQueryClient();

    return useMutation({
        mutationFn: async ({ gateway, attempt, code }: Payment) => {

            const token = await orders.quote(id, key.attempt("order-quote"));

            return intentOf(await orders.pay(id, token, gateway, attempt, code), id);

        },
        meta: { quiet: true },
        onSettled: () => {

            cache.invalidateQueries({ queryKey: [ "orders" ] });
            cache.invalidateQueries({ queryKey: [ "wallet" ] });

        },
    });

}

export function useCancelOrder ( id: number ) {

    const cache = useQueryClient();

    return useMutation({
        mutationFn: () => orders.cancel(id, key.attempt("order-cancel")),
        onSettled: () => {

            cache.invalidateQueries({ queryKey: [ "orders" ] });
            cache.invalidateQueries({ queryKey: [ "wallet" ] });

        },
    });

}

export function useReviewOrder ( id: number ) {

    const cache = useQueryClient();

    return useMutation({
        mutationFn: ( input: OrderReview ) => orders.review(id, input, key.attempt("order-review")),
        onSuccess: () => { cache.invalidateQueries({ queryKey: [ "orders" ] }); },
    });

}

export function useOrdersRefresh () {

    const cache = useQueryClient();

    return () => { cache.invalidateQueries({ queryKey: [ "orders" ] }); };

}
