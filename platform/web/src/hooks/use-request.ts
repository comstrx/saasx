"use client";

import { type Dispatch, type RefObject, type SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@/api/core/error";
import { onMutation } from "@/api/core/invalidation";
import type { ApiResult } from "@/api/core/response";
import type { Feature } from "@/api/features";
import { reportError } from "@/lib/observe/browser";
import { fingerprint as digest, uuid } from "@/lib/std/security";

type RequestState<T> = { data: T | null; loading: boolean; error: ApiError | null; meta?: ApiResult<T>["meta"] };
type Command<T> = ( options: { signal: AbortSignal; idempotencyKey: string } ) => Promise<T>;
type Loader<T> = ( signal: AbortSignal ) => Promise<ApiResult<T>>;
type Setter<T> = Dispatch<SetStateAction<RequestState<T>>>;
type Fingerprint = string | (() => Promise<string>);

type CommandState = {
    running: RefObject<boolean>;
    controller: RefObject<AbortController | null>;
    attempt: RefObject<{ fingerprint: string; id: string } | null>;
    setPending: ( value: boolean ) => void;
    setError: ( value: ApiError | null ) => void;
};

function definitive ( failure: unknown ): boolean {

    return failure instanceof ApiError && (failure.kind === "input" || [400, 401, 403, 404, 422].includes(failure.status));

}
function failed ( failure: unknown ): ApiError {

    if ( failure instanceof ApiError ) return failure;
    if ( failure instanceof RangeError ) return new ApiError("input", { cause: failure });

    reportError(failure);

    return new ApiError("network", { cause: failure });

}
function settle<T> ( load: Loader<T>, signal: AbortSignal, current: () => boolean, setState: Setter<T> ): void {

    load(signal).then(( result ) => {

        if ( current() ) setState({ data: result.resource, meta: result.meta, loading: false, error: null });

    }).catch(( error: unknown ) => {

        if ( current() ) setState({ data: null, loading: false, error: failed(error) });

    });

}
function begin<T> ( setState: Setter<T>, same: boolean ): void {

    setState(( previous ) => ({
        data: same ? previous.data : null,
        meta: same ? previous.meta : undefined,
        loading: true,
        error: null,
    }));

}
function claim ( command: CommandState ): AbortController | undefined {

    if ( command.running.current ) return undefined;

    const current = new AbortController();

    command.running.current = true;
    command.controller.current = current;

    command.setPending(true);
    command.setError(null);

    return current;

}
async function hashOf ( fingerprint: Fingerprint ): Promise<string> {

    return digest(typeof fingerprint === "function" ? await fingerprint() : fingerprint);

}
async function perform<T> ( command: CommandState, current: AbortController, hash: string, action: Command<T> ): Promise<T | undefined> {

    if ( current.signal.aborted ) return undefined;
    if ( command.attempt.current?.fingerprint !== hash ) command.attempt.current = { fingerprint: hash, id: uuid() };

    const result = await action({ signal: current.signal, idempotencyKey: command.attempt.current.id });

    command.attempt.current = null;

    return result;

}
async function execute<T> ( command: CommandState, fingerprint: Fingerprint, action: Command<T> ): Promise<T | undefined> {

    const current = claim(command);

    if ( !current ) return undefined;

    try {

        return await perform(command, current, await hashOf(fingerprint), action);

    }
    catch ( failure ) {

        if ( definitive(failure) ) command.attempt.current = null;
        if ( !current.signal.aborted ) command.setError(failed(failure));

        return undefined;

    }
    finally {

        if ( command.controller.current === current ) {

            command.running.current = false;
            command.setPending(false);

        }

    }

}
export function useRequest<T> ( load: Loader<T>, enabled = true ) {

    const [state, setState] = useState<RequestState<T>>({ data: null, loading: enabled, error: null });
    const [request, refresh] = useState<object>({});
    const active = useRef<object | null>(null);
    const previousLoad = useRef(load);
    const reload = useCallback(() => refresh({}), []);

    useEffect(() => {

        const controller = new AbortController();

        active.current = request;

        if ( !enabled ) {

            setState({ data: null, loading: false, error: null });
            return;

        }

        begin(setState, previousLoad.current === load);
        previousLoad.current = load;
        settle(load, controller.signal, () => !controller.signal.aborted && active.current === request, setState);

        return () => controller.abort();

    }, [load, enabled, request]);

    return { ...state, reload };

}
export function useCommand () {

    const running = useRef(false);
    const controller = useRef<AbortController | null>(null);
    const attempt = useRef<{ fingerprint: string; id: string } | null>(null);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<ApiError | null>(null);
    const command = useRef<CommandState>({ running, controller, attempt, setPending, setError });
    const run = useCallback(<T> ( fingerprint: Fingerprint, action: Command<T> ) => execute(command.current, fingerprint, action), []);
    const clear = useCallback(() => setError(null), []);

    useEffect(() => () => {

        controller.current?.abort();
        running.current = false;

    }, []);

    return { run, pending, error, clear };

}
export function useInvalidation ( feature: Feature, receive: () => void ): void {

    const latest = useRef(receive);

    useEffect(() => { latest.current = receive; }, [receive]);
    useEffect(() => onMutation(feature, () => latest.current()), [feature]);

}
