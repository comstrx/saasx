"use client";

import { useQuery } from "@tanstack/react-query";
import { api, queryKey, request } from "@/api";

export function useHealth () {

    const { data, isPending, isError, dataUpdatedAt } = useQuery({
        queryKey: queryKey(api.health),
        queryFn: ({ signal }) => request(api.health, { signal }),
        refetchInterval: 30_000,
        staleTime: 25_000,
    });

    return {
        isPending,
        isUp: !isError && data?.data.status === "ok",
        checkedAt: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
    };

}
