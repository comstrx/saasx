import { useQuery } from "@tanstack/react-query";
import { content } from "@/api/endpoints/content";
import { blocksOf, siteOf } from "@/model/content";

const hour = 3600000;
const day = 86400000;

const contentKeys = {
    site: [ "content", "site" ] as const,
    page: ( page: string ) => [ "content", "page", page ] as const,
};

export function useSiteInfo () {

    return useQuery({
        queryKey: contentKeys.site,
        queryFn: async () => siteOf(await content.site()),
        staleTime: hour,
        gcTime: day * 7,
    });

}

export function useContentPage ( page: string ) {

    return useQuery({
        queryKey: contentKeys.page(page),
        queryFn: async () => blocksOf(await content.page(page)),
        staleTime: hour,
        gcTime: day * 7,
        enabled: page.length > 0,
    });

}
