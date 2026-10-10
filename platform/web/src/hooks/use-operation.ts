"use client";

import { useCallback, useMemo, useState } from "react";
import type { ApiSurface, Operation as Call, RequestOptions, Result } from "@/api/core/client";
import type { LiveTopic } from "@/api/core/config";
import type { Endpoint } from "@/api/core/dsl";
import type { ApiError } from "@/api/core/error";
import type { EndpointOf, Endpoints, Feature } from "@/api/features";
import { useApi } from "@/hooks/use-api";
import { useRealtime } from "@/hooks/use-realtime";
import { useCommand, useInvalidation, useRequest } from "@/hooks/use-request";
import type { z } from "@/lib/providers/schema";

type Input<E extends Endpoint> = z.input<E["input"]>;
type Resource<E extends Endpoint> = Result<E>["resource"];
type ReadOptions<T> = { enabled?: boolean; initial?: T; live?: LiveTopic };
type Read<E extends Endpoint> = {
    data: Resource<E> | null;
    meta?: Result<E>["meta"];
    loading: boolean;
    error: ApiError | null;
    reload: () => void;
};
type Action<E extends Endpoint> = {
    run: ( input: Input<E>, options?: Pick<RequestOptions, "idempotencyKey"> ) => Promise<Result<E> | undefined>;
    pending: boolean;
    error: ApiError | null;
    result: Result<E> | null;
    clear: () => void;
};

export function useRead<F extends Feature, O extends keyof Endpoints[F] & string> (
    feature: F,
    operation: O,
    input?: Input<EndpointOf<F, O>>,
    { enabled = true, initial, live }: ReadOptions<Resource<EndpointOf<F, O>>> = {},
): Read<EndpointOf<F, O>> {

    const api = useApi();
    const key = JSON.stringify(input ?? {});
    const stable = useMemo(() => JSON.parse(key) as Input<EndpointOf<F, O>>, [key]);
    const [refreshed, setRefreshed] = useState(0);
    const active = enabled && (initial === undefined || refreshed > 0);
    const call = (api as unknown as ApiSurface)[feature]?.[operation] as Call;
    const load = useCallback(( signal: AbortSignal ) => call(stable, { signal }) as Promise<Result<EndpointOf<F, O>>>, [call, stable]);
    const request = useRequest(load, active);
    const reload = useCallback(() => { setRefreshed(( count ) => count + 1); request.reload(); }, [request.reload]);

    useInvalidation(feature, reload);
    useRealtime(live ?? "notifications", reload, undefined, enabled && live !== undefined);

    return {
        data: request.data ?? initial ?? null,
        meta: request.meta,
        loading: active && request.loading,
        error: request.error,
        reload,
    };

}
export function useAction<F extends Feature, O extends keyof Endpoints[F] & string> ( feature: F, operation: O ): Action<EndpointOf<F, O>> {

    const api = useApi();
    const command = useCommand();
    const call = (api as unknown as ApiSurface)[feature]?.[operation] as Call;
    const [result, setResult] = useState<Result<EndpointOf<F, O>> | null>(null);
    const run = useCallback(async ( input: Input<EndpointOf<F, O>>, options: Pick<RequestOptions, "idempotencyKey"> = {} ) => {

        const answer = await command.run(JSON.stringify([feature, operation, input]), ( { signal, idempotencyKey } ) => {

            return call(input, { signal, idempotencyKey: options.idempotencyKey ?? idempotencyKey }) as Promise<Result<EndpointOf<F, O>>>;

        });

        if ( answer !== undefined ) setResult(answer);

        return answer;

    }, [call, feature, operation, command.run]);

    return { run, pending: command.pending, error: command.error, result, clear: command.clear };

}
