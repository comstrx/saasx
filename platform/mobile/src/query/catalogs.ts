import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { type CatalogQuery, catalogs, detail } from "@/api/endpoints/catalogs";
import { vendors } from "@/api/endpoints/vendors";
import { availabilityFrom } from "@/model/availability";
import { listingsOf } from "@/model/catalog";
import { detailOf, reviewFeedOf, vendorOf } from "@/model/detail";
import { useSigned } from "@/query/wire";
import { key } from "@/std/key";

const catalogKeys = {
    list: ( params: CatalogQuery ) => [ "catalogs", params ] as const,
    show: ( id: number, guests: Guests ) => [ "catalogs", id, guests ] as const,
    reviews: ( id: number ) => [ "catalogs", id, "reviews" ] as const,
    recent: () => [ "catalogs", "recent" ] as const,
    census: () => [ "catalogs", "census" ] as const,
    availability: ( id: number, from: string, to: string ) => [ "catalogs", id, "availability", from, to ] as const,
    similar: ( id: number ) => [ "catalogs", id, "similar" ] as const,
    vendor: ( id: number ) => [ "vendors", id ] as const,
    hostReviews: ( id: number ) => [ "vendors", id, "reviews" ] as const,
};

type Guests = {
    adults: number;
    children: number;
};

export function useCatalogs ( params: CatalogQuery, enabled = true ) {

    return useQuery({
        queryKey: catalogKeys.list(params),
        queryFn: async () => listingsOf(await catalogs.list(params)),
        enabled,
    });

}

export function useCatalogCensus () {

    return useQuery({
        queryKey: catalogKeys.census(),
        queryFn: () => catalogs.census(),
        staleTime: 300000,
    });

}

export function useRecentCatalogs ( enabled = true ) {

    return useQuery({
        queryKey: catalogKeys.recent(),
        queryFn: async () => listingsOf(await catalogs.recent()),
        enabled,
    });

}

export function useCatalog ( id: number, guests: Guests ) {

    return useQuery({
        queryKey: catalogKeys.show(id, guests),
        queryFn: async () => detailOf(await detail.show(id, guests)),
        enabled: id > 0,
    });

}

export function useRecordView () {

    const signed = useSigned();
    const { mutate } = useMutation({
        mutationFn: ( id: number ) => catalogs.view(id),
        meta: { quiet: true },
    });

    return useCallback(( id: number ) => { if ( signed ) mutate(id); }, [ signed, mutate ]);

}

export function useSimilar ( id: number, enabled = true ) {

    return useQuery({
        queryKey: catalogKeys.similar(id),
        queryFn: async () => listingsOf(await detail.similar(id)),
        enabled: id > 0 && enabled,
        staleTime: 300000,
    });

}

export function useReviews ( id: number, enabled = true ) {

    return useQuery({
        queryKey: catalogKeys.reviews(id),
        queryFn: async () => reviewFeedOf(await detail.reviews(id, { limit: 8, spread: true })),
        enabled: id > 0 && enabled,
    });

}

export function useVendor ( id: number ) {

    return useQuery({
        queryKey: catalogKeys.vendor(id),
        queryFn: async () => vendorOf(await vendors.show(id)),
        enabled: id > 0,
    });

}

export function useHostReviews ( id: number ) {

    return useQuery({
        queryKey: catalogKeys.hostReviews(id),
        queryFn: async () => reviewFeedOf(await vendors.reviews(id)),
        enabled: id > 0,
    });

}

export function useReviewFeed ( id: number, sort: string, search: string, enabled: boolean ) {

    return useQuery({
        queryKey: [ ...catalogKeys.reviews(id), sort, search ],
        queryFn: async () => reviewFeedOf(await detail.reviews(id, { sort, search, limit: 50 })),
        enabled: id > 0 && enabled,
        placeholderData: keepPreviousData,
    });

}

export function useReport ( id: number ) {

    return useMutation({
        mutationFn: ({ reason, note }: { reason: string; note: string }) => detail.report(id, reason, note, key.attempt("catalog-report")),
    });

}

export function useAvailability ( id: number, from: string, to: string, enabled = true ) {

    return useQuery({
        queryKey: catalogKeys.availability(id, from, to),
        queryFn: async () => availabilityFrom(await detail.availability(id, from, to)),
        enabled: enabled && id > 0 && from.length > 0 && to.length > 0,
        staleTime: 300000,
    });

}
