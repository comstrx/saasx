import NetInfo from "@react-native-community/netinfo";
import { onlineManager, QueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ApiError, failureOf } from "@/api/client";

declare module "@tanstack/react-query" {

    interface Register {
        mutationMeta: {
            quiet?: boolean;
            field?: string;
        };
    }

}

const minute = 60000;
const day = minute * 60 * 24;

const backoff = ( attempt: number ) => Math.min(8000, 600 * 2 ** attempt);

const waited = ( attempt: number, reason: unknown ): number => {

    const seconds = Number(failureOf(reason).meta.retry_after ?? 0);

    return seconds > 0 ? seconds * 1000 : backoff(attempt);

};

const worthRetrying = ( attempt: number, reason: unknown ): boolean => {

    const failure = failureOf(reason);

    return attempt < 2 && ( failure.transient || failure.throttled );

};

export const queries = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: minute,
            gcTime: day,
            retry: worthRetrying,
            retryDelay: waited,
            refetchOnReconnect: true,
        },
        mutations: {
            retry: 0,
        },
    },
});

onlineManager.setEventListener(( setOnline ) => NetInfo.addEventListener(( state ) => setOnline(Boolean(state.isConnected)) ));

export function useReachable (): boolean {

    const [ reachable, setReachable ] = useState(true);

    useEffect(() => queries.getQueryCache().subscribe(( event ) => {

        if ( event.type !== "updated" ) return;
        if ( event.action.type === "success" ) setReachable(true);
        if ( event.action.type === "error" && event.action.error instanceof ApiError && event.action.error.offline ) setReachable(false);

    }), []);

    return reachable;

}
