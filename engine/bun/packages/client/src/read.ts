import type { ApiSurface, Pagination } from "engine/api";
import { isRecord } from "engine/base";
import type { Route } from "engine/screen";
import type { CompiledPort } from "engine/spec";
import { type Resource, useResource } from "engine/state";
import { useEffect, useMemo, useRef, useState } from "react";
import { type PortCache, portMemory } from "./cache.ts";
import { applyPatch } from "./patch.ts";
import { fillInput, localPort, portAnswer, portSource } from "./port.ts";
import { onTouched } from "./touches.ts";

export type PortLive = {
    subscribe: ( channel: string, events: readonly string[], handler: ( event: string, data: unknown ) => void ) => () => void;
};
export type PortOptions = { cache?: PortCache | undefined; live?: PortLive | undefined; settleMs?: number | undefined };

const settleDefault = 400;

export function portKey ( port: CompiledPort | undefined, route: Route, identity: readonly unknown[] ): string {

    if ( port?.kind !== "read" ) return JSON.stringify([port, identity]);

    return `${port.feature}.${port.operation}|${JSON.stringify(fillInput(port.input, route))}|${JSON.stringify(identity)}`;

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
    const caching = port?.kind === "read" && !idle ? cache : undefined;
    const remembered = useMemo(
        () => portMemory(caching, facts),
        [caching?.store, caching?.ttl, caching?.prefix, caching?.limit, facts],
    );
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
