import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { search } from "@/api/endpoints/search";
import { hintOf, type SearchQuery, searchPageOf, searchTerms } from "@/model/search";
import { nextPage } from "@/query/shelf";

const searchKeys = {
    suggest: ( term: string ) => [ "search", "suggest", term ] as const,
    results: ( query: SearchQuery ) => [ "search", "results", query ] as const,
    count: ( query: SearchQuery ) => [ "search", "count", query ] as const,
};

export function useSuggest ( term: string ) {

    const needle = term.trim();

    return useQuery({
        queryKey: searchKeys.suggest(needle),
        queryFn: async () => ( await search.suggest(needle) ).map(hintOf),
        enabled: needle.length > 0,
        staleTime: 60000,
    });

}

export function useSearchResults ( query: SearchQuery ) {

    return useInfiniteQuery({
        queryKey: searchKeys.results(query),
        queryFn: async ({ pageParam }) => searchPageOf(await search.results(searchTerms(query, pageParam))),
        initialPageParam: 1,
        getNextPageParam: nextPage,
        placeholderData: ( previous ) => previous,
        staleTime: 30000,
    });

}

export function useSearchCount ( query: SearchQuery, enabled: boolean ) {

    return useQuery({
        queryKey: searchKeys.count(query),
        queryFn: async () => searchPageOf(await search.results(searchTerms(query, 1, 1))).total,
        enabled,
        placeholderData: ( previous ) => previous,
        staleTime: 30000,
    });

}
