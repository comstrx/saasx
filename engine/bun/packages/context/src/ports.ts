import type { ApiResult, ApiSurface, RequestOptions } from "@engine/api";
import { removeBy, upsertBy } from "@engine/array";
import { isRecord, pathGet, uuid } from "@engine/base";
import { transient } from "@engine/error";
import {
    type CompiledPort,
    fillInput,
    localPort,
    type Pagination,
    type Patch,
    portAnswer,
    portSource,
    type Route,
    row,
    rows,
} from "@engine/spec";
import type { Store } from "@engine/storage";
import { typed } from "@engine/storage";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Outbox } from "./outbox.ts";
import { type Resource, type Runner, useAction, useResource } from "./react.ts";
import { onTouched, touched } from "./touches.ts";

export type Written = ApiResult<unknown>;
export type Input = Record<string, unknown>;
export type PortCache = { store: Store; ttl: number; prefix?: string | undefined };
export type PortLive = {
    subscribe: (
        channel: string,
        events: readonly string[],
        handler: ( event: string, data: unknown ) => void,
    ) => () => void;
};
export type PortOptions = { cache?: PortCache | undefined; live?: PortLive | undefined; settleMs?: number | undefined };
export type Patched = { value: unknown; applied: boolean };

const settleDefault = 400;

function newer ( current: unknown, incoming: unknown, version: string | undefined ): boolean {

    if ( !version || !isRecord(current) || !isRecord(incoming) ) return true;

    const before = current[version];
    const after = incoming[version];

    if ( before === undefined || after === undefined ) return true;

    return String(after) >= String(before);

}
export function applyPatch ( current: unknown, many: boolean, event: string, data: unknown, patch: Patch ): Patched {

    const incoming = pathGet(data, patch.path);
    const untouched = { value: current, applied: false };

    if ( !isRecord(incoming) || incoming[patch.key] === undefined ) return untouched;

    const id = incoming[patch.key];
    const gone = event.endsWith(".deleted") || incoming.deleted === true;

    if ( many ) {

        const list = rows(current);
        const held = list.find(( item ) => item[patch.key] === id);

        if ( !held ) return untouched;

        if ( gone ) return { value: removeBy(list, patch.key, id), applied: true };

        if ( !newer(held, incoming, patch.version) ) return untouched;

        return { value: upsertBy(list, { ...held, ...incoming }, patch.key, false).items, applied: true };

    }

    const held = row(current);

    if ( !held || held[patch.key] !== id || gone || !newer(held, incoming, patch.version) ) return untouched;

    return { value: { ...held, ...incoming }, applied: true };

}
export function portKey ( port: CompiledPort | undefined, route: Route, identity: readonly unknown[] ): string {

    const input = port?.kind === "read" ? fillInput(port.input, route) : undefined;

    return JSON.stringify([port, input, identity]);

}
function waiting ( port: CompiledPort | undefined, route: Route ): boolean {

    if ( port?.kind !== "read" ) return false;

    return Object.values(port.input).some(
        ( value ) =>
            isRecord(value) &&
            "signal" in value &&
            value.wait === true &&
            route.signals?.[value.signal as string] === undefined,
    );

}

type Cached = { at: number; value: unknown };

const memory = new Map<string, Cached>();

export function portMemory (
    cache: PortCache | undefined,
    key: string,
): { seed: () => unknown | Promise<unknown>; keep: ( value: unknown ) => void } {

    const id = `${cache?.prefix ?? "port"}:${key}`;
    const box = cache ? typed<Cached>(cache.store) : undefined;
    const fresh = ( entry: Cached | undefined ): unknown =>
        entry && (cache?.ttl ?? 0) > 0 && Date.now() - entry.at <= (cache?.ttl ?? 0) ? entry.value : undefined;

    return {
        seed: () => {

            const known = memory.get(id);

            if ( known || !box ) return fresh(known);

            return box.read(id).then(( entry ) => {

                if ( entry && !memory.has(id) ) memory.set(id, entry);

                return fresh(memory.get(id));

            });

        },
        keep: ( value ) => {

            const entry = { at: Date.now(), value };

            memory.set(id, entry);
            void box?.write(id, entry);

        },
    };

}

export type Queued = { resource: null; message: null; meta: { source: "queued"; requestId?: undefined } };

export function useOperation (
    api: ApiSurface,
    port: CompiledPort | undefined,
    outbox?: Outbox,
): Runner<Input, Written | Queued, RequestOptions> {

    const feature = port?.kind === "write" ? port.feature : "";
    const operation = port?.kind === "write" ? port.operation : "";
    const touches = port?.kind === "write" ? port.touches.join(",") : "";
    const perform = useCallback(
        async ( input: Input, options?: RequestOptions ): Promise<Written | Queued> => {

            const call = api[feature]?.[operation];

            if ( !call ) throw new Error(`No write bound for ${feature}.${operation}.`);

            const idempotencyKey = options?.idempotencyKey ?? uuid();

            try {

                const written = await call(input, { ...options, idempotencyKey });

                if ( touches ) touched(touches.split(","));

                return written;

            } catch ( error ) {

                if ( !outbox || !transient(error) ) throw error;

                await outbox.add({ feature, operation, input, idempotencyKey });

                return { resource: null, message: null, meta: { source: "queued" } };

            }

        },
        [api, feature, operation, touches, outbox],
    );

    return useAction<Input, Written | Queued, RequestOptions>(perform);

}
export function usePortResource (
    api: ApiSurface,
    port: CompiledPort | undefined,
    route: Route,
    site: () => unknown,
    identity: readonly unknown[] = [],
    { cache, live, settleMs = settleDefault }: PortOptions = {},
): Resource<unknown, Pagination> {

    const [tick, setTick] = useState(0);
    const paging = useRef<Pagination | undefined>(undefined);
    const [overlay, setOverlay] = useState<{ base: unknown; value: unknown; facts: string } | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const latest = useRef<unknown>(undefined);
    const idle = waiting(port, route);
    const channel = port?.kind === "read" ? port.live : undefined;
    const many = port?.kind === "read" ? port.many : false;
    const facts = portKey(port, route, identity);
    const key = `${idle ? "idle:" : ""}${facts}${tick ? `#${tick}` : ""}`;
    const remembered = portMemory(port?.kind === "read" && !idle ? cache : undefined, facts);
    const events = channel?.events.join(",") ?? "";
    const patch = channel?.patch;

    const readFeature = port?.kind === "read" && !idle ? port.feature : "";

    useEffect(() => {

        if ( !readFeature ) return undefined;

        return onTouched(readFeature, () => setTick(( count ) => count + 1));

    }, [readFeature]);
    useEffect(() => {

        if ( !channel || !live || idle ) return undefined;

        const off = live.subscribe(channel.channel, events ? events.split(",") : [], ( event, data ) => {

            if ( patch ) {

                setOverlay(( shown ) => {

                    const base = latest.current;
                    const current = shown && shown.facts === facts && shown.base === base ? shown.value : base;
                    const result = applyPatch(current, many, event, data, patch);

                    if ( !result.applied ) return shown;

                    remembered.keep(result.value);

                    return { base, value: result.value, facts };

                });

            }

            if ( timer.current ) clearTimeout(timer.current);

            timer.current = setTimeout(() => setTick(( count ) => count + 1), settleMs);

        });

        return () => {

            off();

            if ( timer.current ) clearTimeout(timer.current);

        };

    }, [channel?.channel, events, live, idle, facts]);

    const resource = useResource(
        key,
        async ( signal ) => {

            if ( idle ) return undefined;

            const { value, pagination } = await portAnswer(port, route, portSource(api, site), signal);

            paging.current = pagination;

            if ( port?.kind === "read" ) remembered.keep(value);

            return value;

        },
        () => localPort(port, site()),
        remembered.seed,
    );

    if ( resource.status === "ready" ) latest.current = resource.value;

    const meta = paging.current;
    const shown =
        overlay && overlay.facts === facts && resource.status === "ready" && overlay.base === resource.value
            ? overlay
            : null;

    return useMemo((): Resource<unknown, Pagination> => {

        if ( idle ) return { status: "idle" };

        if ( resource.status !== "ready" ) return resource;

        if ( shown ) {

            return {
                status: "ready",
                value: shown.value,
                stale: true,
                meta,
                ...(resource.error !== undefined ? { error: resource.error } : {}),
            };

        }

        return { ...resource, meta };

    }, [idle, resource, shown, meta]);

}
