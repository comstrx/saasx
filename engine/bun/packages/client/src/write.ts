import type { ApiResult, ApiSurface, RequestOptions } from "engine/api";
import { uuid } from "engine/base";
import { transient } from "engine/error";
import type { CompiledPort } from "engine/spec";
import { type Runner, useAction } from "engine/state";
import { useCallback } from "react";
import type { Outbox } from "./outbox.ts";
import { touched } from "./touches.ts";

export type Input = Record<string, unknown>;
export type Written = ApiResult<unknown>;
export type Queued = { resource: null; message: null; meta: { source: "queued"; requestId?: undefined } };
export type WriteTarget = { feature: string; operation: string; touches: readonly string[] };

const queued: Queued = { resource: null, message: null, meta: { source: "queued" } };

export async function performWrite (
    api: ApiSurface,
    port: WriteTarget,
    input: Input,
    options: RequestOptions = {},
    outbox?: Outbox,
): Promise<Written | Queued> {

    const call = api[port.feature]?.[port.operation];

    if ( !call ) throw new Error(`No write bound for ${port.feature}.${port.operation}.`);

    const idempotencyKey = options.idempotencyKey ?? uuid();

    try {

        const written = await call(input, { ...options, idempotencyKey });

        touched(port.touches);

        return written;

    } catch ( error ) {

        if ( !outbox || !transient(error) ) throw error;

        await outbox.add({ feature: port.feature, operation: port.operation, input, idempotencyKey });

        return queued;

    }

}
export function useOperation (
    api: ApiSurface,
    port: CompiledPort | undefined,
    outbox?: Outbox,
): Runner<Input, Written | Queued, RequestOptions> {

    const feature = port?.kind === "write" ? port.feature : "";
    const operation = port?.kind === "write" ? port.operation : "";
    const touches = port?.kind === "write" ? port.touches.join(",") : "";
    const perform = useCallback(( input: Input, options?: RequestOptions ) => {

        const target = { feature, operation, touches: touches ? touches.split(",") : [] };

        return performWrite(api, target, input, options, outbox);

    }, [api, feature, operation, touches, outbox]);

    return useAction<Input, Written | Queued, RequestOptions>(perform);

}
