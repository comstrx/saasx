import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { coupons } from "@/api/endpoints/coupons";
import { couponCheckOf, couponEventOf, couponOf } from "@/model/coupon";
import { shelve } from "@/model/shelf";
import { nextPage } from "@/query/shelf";
import { useSigned } from "@/query/wire";
import { key } from "@/std/key";

const couponKeys = {
    available: [ "coupons", "available" ] as const,
    mine: [ "coupons", "mine" ] as const,
    history: [ "coupons", "history" ] as const,
};

export function useCoupons ( mine: boolean ) {

    const signed = useSigned();

    return useInfiniteQuery({
        queryKey: mine ? couponKeys.mine : couponKeys.available,
        queryFn: async ({ pageParam }) => shelve(await ( mine ? coupons.mine(pageParam) : coupons.available(pageParam) ), ( rows ) => rows.map(( row ) => couponOf(row, mine) )),
        initialPageParam: 1,
        getNextPageParam: nextPage,
        enabled: signed,
    });

}

export function useCouponHistory ( on: boolean ) {

    const signed = useSigned();

    return useQuery({
        queryKey: couponKeys.history,
        queryFn: async () => ( await coupons.history() ).map(couponEventOf),
        enabled: signed && on,
    });

}

export function useRedeem () {

    const cache = useQueryClient();

    return useMutation({
        mutationFn: ( id: number ) => coupons.redeem(id, key.attempt("redeem")),
        onSuccess: () => { cache.invalidateQueries({ queryKey: [ "coupons" ] }); },
    });

}

export function useValidateCoupon ( catalog: number, quantity: number ) {

    return useMutation({
        mutationFn: async ( code: string ) => couponCheckOf(await coupons.validate(code, catalog, quantity, key.attempt("coupon-validate")), code),
    });

}
