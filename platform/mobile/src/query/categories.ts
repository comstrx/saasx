import { useQuery } from "@tanstack/react-query";
import { categories } from "@/api/endpoints/categories";
import { listingsOf } from "@/model/catalog";
import { categoryOf } from "@/model/category";

const categoryKeys = {
    list: [ "categories" ] as const,
    recent: () => [ "categories", "recent" ] as const,
    show: ( id: number ) => [ "categories", id ] as const,
    catalogs: ( id: number ) => [ "categories", id, "catalogs" ] as const,
};

export function useCategories () {

    return useQuery({
        queryKey: categoryKeys.list,
        queryFn: async () => ( await categories.list() ).map(categoryOf),
        staleTime: 300000,
    });

}

export function useRecentCategories ( enabled = true ) {

    return useQuery({
        queryKey: categoryKeys.recent(),
        queryFn: async () => ( await categories.recent() ).map(categoryOf),
        enabled,
        staleTime: 300000,
    });

}

export function useCategory ( id: number ) {

    return useQuery({
        queryKey: categoryKeys.show(id),
        queryFn: async () => categoryOf(await categories.show(id)),
        enabled: id > 0,
    });

}

export function useCategoryCatalogs ( id: number ) {

    return useQuery({
        queryKey: categoryKeys.catalogs(id),
        queryFn: async () => listingsOf(await categories.catalogs(id)),
        enabled: id > 0,
    });

}
