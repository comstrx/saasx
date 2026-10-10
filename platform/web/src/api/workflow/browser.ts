"use client";

import type { UploadLimits } from "../../lib/std/form.ts";
import type { ApiClient, ApiSurface, Operation } from "../core/client.ts";
import type { LiveTopic } from "../core/config.ts";
import { ApiError } from "../core/error.ts";
import type { Socket } from "../core/realtime.ts";
import type { remoteApi, Values, Watch } from "./remote.ts";

type Remote = ReturnType<typeof remoteApi>;
type Load = () => Promise<Remote>;
type Loading = { pending?: Promise<Remote> };
type Live = { closed: boolean; close: () => void };
type Surface = () => Promise<ApiSurface>;
type Feature = Readonly<Record<string, Operation>>;

const inert = ["then", "toJSON", "constructor", "$$typeof"];

function named<T> ( known: Map<string, T>, key: string | symbol, make: ( name: string ) => T ): T | undefined {

    if ( typeof key === "symbol" || inert.includes(key) ) return undefined;

    const found = known.get(key) ?? make(key);

    known.set(key, found);

    return found;

}
function operation ( load: Surface, feature: string, name: string ): Operation {

    return async ( input, options ) => {

        const call = (await load())[feature]?.[name];

        if ( !call ) throw new ApiError("input");

        return call(input, options);

    };

}
function feature ( load: Surface, name: string ): Feature {

    const operations = new Map<string, Operation>();

    return new Proxy<Feature>({}, { get: ( _, key ) => named(operations, key, ( found ) => operation(load, name, found)) });

}
function deferApi<E extends object> ( load: Surface, extras: E ): ApiClient & E {

    const features = new Map<string, Feature>();

    return new Proxy(extras, {
        get: ( target, key ) => typeof key === "string" && Object.hasOwn(target, key)
            ? Reflect.get(target, key)
            : named(features, key, ( found ) => feature(load, found)),
    }) as ApiClient & E;

}
function loader ( values: Values, limits?: UploadLimits, socket?: Socket ): Load {

    const loading: Loading = {};

    return () => loading.pending ??= import("./remote.ts").then(( module ) => module.remoteApi(values, limits, socket), ( error: unknown ) => {

        loading.pending = undefined;
        throw error;

    });

}
function subscribe ( load: Load, topic: LiveTopic, options: Watch ): () => void {

    const live: Live = { closed: false, close: () => {} };

    load().then(( remote ) => {

        if ( !live.closed ) live.close = remote.subscribe(topic, options);

    }).catch(() => options.onStatus?.(false));

    return () => {

        live.closed = true;
        live.close();

    };

}
export function browserApi ( values: Values, limits?: UploadLimits, socket?: Socket ) {

    const load = loader(values, limits, socket);

    return deferApi(async () => (await load()).surface, {
        realtime: {
            subscribe: ( topic: LiveTopic, options: Watch ) => subscribe(load, topic, options),
        },
    });

}
