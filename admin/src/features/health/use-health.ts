import { useQuery } from "@tanstack/react-query";
import { request } from "@/api/client";
import { api } from "@/api/registry";

export function useHealth () {

    return useQuery({
        queryKey: [api.health.resource, api.health.action],
        queryFn: ({ signal }) => request(api.health, { signal }),
        refetchInterval: 30_000,
        retry: false,
    });

}
