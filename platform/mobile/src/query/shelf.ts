import type { InfiniteData } from "@tanstack/react-query";
import type { Shelf } from "@/model/shelf";

export const nextPage = ( last: Shelf<unknown> ): number | undefined => last.page < last.pages ? last.page + 1 : undefined;

export const itemsOf = <T>( data: InfiniteData<Shelf<T>> | undefined ): readonly T[] =>
    data?.pages.flatMap(( shelf ) => shelf.items ) ?? [];
