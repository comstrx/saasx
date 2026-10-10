import { z } from "../../lib/providers/schema.ts";
import { filterKeys, includes, mapValues } from "../../lib/std/object.ts";
import { templateKeys } from "../../lib/std/route.ts";
import { type Endpoints, endpoints } from "../features/index.ts";
import { type ApiConfig, type ApiInput, apiInputShape, apiShape, connectionDefaults, type Reachable } from "./config.ts";
import type { Endpoint } from "./dsl.ts";
import { ack } from "./fields.ts";
import { target } from "./request.ts";
import { parseResource, type ResourceValues, resourceDefaults, resourceKeys } from "./resource.ts";
import {
    aggregateDefaults, type Contract, contractShape, envelopeDefaults, headerDefaults, type Layer, layerShape, merge,
    paginationDefaults, type Wire, wireShape,
} from "./wire.ts";

type Catalogue = Record<string, Record<string, Endpoint>>;
type Outputs<E extends Endpoint> = keyof z.output<E["output"]> & string;
type Overrides = z.output<typeof overridesShape>;

type OperationOverride<E extends Endpoint> = Omit<Layer, "request" | "response"> & {
    request?: Omit<NonNullable<Layer["request"]>, "fields"> & { fields?: { [K in keyof z.input<E["input"]>]?: string | null } };
    response?: Omit<NonNullable<Layer["response"]>, "fields"> & { fields?: { [K in Outputs<E>]?: string } };
};
type FeatureOverride<E extends Record<string, Endpoint>> = Omit<Layer, "method" | "path"> & {
    operations?: { [O in keyof E]?: OperationOverride<E[O]> | boolean };
};
export type BrowserConfig = {
    api: Omit<ApiConfig, "context" | "connections"> & { context: Omit<ApiConfig["context"], "authCookie">; connections: Record<string, Reachable> };
    contract: Contract;
};
export type ContractOverrides = Omit<Layer, "enabled" | "method" | "path" | "response"> & {
    response?: Omit<NonNullable<Layer["response"]>, "empty">;
    features?: { [F in keyof Endpoints]?: FeatureOverride<Endpoints[F]> | boolean };
};

function switched<T extends z.ZodType> ( shape: T ) {

    return z.preprocess(( value ) => (value === true ? {} : value), z.union([z.literal(false), shape]));

}
const featureShape = layerShape.omit({ method: true, path: true }).extend({
    operations: z.record(z.string(), switched(layerShape)).optional(),
});
export const overridesShape = layerShape.omit({ enabled: true, method: true, path: true }).extend({
    response: layerShape.shape.response.unwrap().omit({ empty: true }).optional(),
    features: z.record(z.string(), switched(featureShape)).optional(),
});

function inputKeys ( endpoint: Endpoint ): string[] {

    return Object.keys(endpoint.input.shape);

}
function outputKeys ( endpoint: Endpoint ): string[] {

    return endpoint.output instanceof z.ZodObject ? Object.keys(endpoint.output.shape) : [];

}
function fit ( layer: Layer, endpoint: Endpoint ): Layer {

    const { request, response, ...rest } = layer;
    const inputs = inputKeys(endpoint);
    const outputs = outputKeys(endpoint);

    if ( !request && !response ) return rest;

    return {
        ...rest,
        ...(request ? { request: { ...request, ...(request.fields ? { fields: filterKeys(request.fields, ( key ) => inputs.includes(key)) } : {}) } } : {}),
        ...(response ? {
            response: {
                ...response,
                ...(response.fields ? { fields: filterKeys(response.fields, ( key ) => outputs.includes(key)) } : {}),
                ...(endpoint.many ? {} : { pagination: undefined, aggregates: undefined }),
            },
        } : {}),
    };

}
function base ( endpoint: Endpoint ): Layer {

    return {
        enabled: true,
        execution: "hybrid",
        connection: "primary",
        encoding: "json",
        method: endpoint.method,
        path: endpoint.path,
        cache: 0,
        request: { headers: headerDefaults, fields: {} },
        response: {
            ...envelopeDefaults,
            empty: endpoint.output === ack,
            pagination: endpoint.many ? paginationDefaults : null,
            aggregates: endpoint.many ? aggregateDefaults : null,
        },
    };

}
function headers ( layer: Layer ): Wire["request"]["headers"] {

    const entries = Object.entries(layer.request?.headers ?? {}).flatMap(( [key, value] ) => {

        if ( !value ) return [];

        return [[key, typeof value === "string" ? { name: value } : value]];

    });

    return Object.fromEntries(entries);

}
function check ( wire: Wire, endpoint: Endpoint, where: string, connections: ApiConfig["connections"], action: Layer ): void {

    const inputs = inputKeys(endpoint);
    const outputs = outputKeys(endpoint);
    const params = templateKeys(wire.path);
    const names = Object.values(wire.request.headers).map(( header ) => header.name.toLowerCase());
    const body = inputs.some(( key ) => !params.includes(key) && target(wire, key)?.place === "body");

    const unknown = [
        ...Object.keys(action.request?.fields ?? {}).filter(( key ) => !inputs.includes(key)).map(( key ) => `request.fields.${key}`),
        ...Object.keys(action.response?.fields ?? {}).filter(( key ) => !outputs.includes(key)).map(( key ) => `response.fields.${key}`),
        ...params.filter(( key ) => !inputs.includes(key)).map(( key ) => `path {${key}}`),
    ];

    if ( unknown.length ) throw new Error(`${where}: unknown ${unknown.join(", ")}.`);
    if ( !Object.hasOwn(connections, wire.connection) ) throw new Error(`${where}: missing connection "${wire.connection}".`);
    if ( new Set(names).size !== names.length ) throw new Error(`${where}: header names must be unique.`);
    if ( wire.method === "GET" && body ) throw new Error(`${where}: GET cannot carry a body.`);
    if ( wire.method !== "GET" && wire.cache ) throw new Error(`${where}: only GET reads can be cached.`);

}
function operation ( global: Layer, shared: Layer, action: Layer | false | undefined, endpoint: Endpoint ) {

    if ( action === false ) return { enabled: false as const };

    const merged = [fit(global, endpoint), endpoint.wire, fit(shared, endpoint), action ?? {}].reduce(merge, base(endpoint));

    if ( !merged.enabled ) return { enabled: false as const };

    return wireShape.parse({ ...merged, request: { headers: headers(merged), fields: merged.request?.fields ?? {} } });

}
function unknown ( keys: string[], known: object, where: string ): void {

    const strangers = keys.filter(( key ) => !Object.hasOwn(known, key));

    if ( strangers.length ) throw new Error(`${where}: unknown ${strangers.join(", ")}.`);

}
function feature ( name: string, operations: Record<string, Endpoint>, chosen: Overrides["features"], global: Layer, api: ApiConfig ) {

    const selected = chosen?.[name];
    const { operations: actions = {}, ...shared } = selected || {};

    unknown(Object.keys(actions), operations, `contract.features.${name}.operations`);

    return mapValues(operations, ( endpoint, key ) => {

        const wire = operation(global, shared, selected === false ? false : actions[key], endpoint);

        if ( wire.enabled ) check(wire, endpoint, `${name}.${key}`, api.connections, actions[key] || {});

        return wire;

    });

}
function values ( seeds: ResourceValues ) {

    return Object.fromEntries(resourceKeys.map(( key ) => [key, parseResource(key, { ...resourceDefaults(key), ...seeds[key] })]));

}
function connect ( input: ApiInput ): ApiConfig {

    const source = apiInputShape.parse(input);

    return apiShape.parse({ ...source, connections: mapValues(source.connections, ( value ) => ({ ...connectionDefaults, ...value })) });

}
export function resolveApi (
    input: ApiInput,
    overrides: ContractOverrides = {},
    seeds: ResourceValues = {},
): { api: ApiConfig; contract: Contract } {

    const api = connect(input);
    const { features: chosen = {}, ...global } = overridesShape.parse(overrides);
    const catalogue: Catalogue = endpoints;

    unknown(Object.keys(chosen), catalogue, "contract.features");

    const features = mapValues(catalogue, ( operations, name ) => feature(name, operations, chosen, global, api));

    return { api, contract: contractShape.parse({ values: values(seeds), features }) };

}
function restrict ( contract: Contract ): { contract: Contract; used: Set<string> } {

    const selected = structuredClone(contract);
    const used = new Set<string>();

    for ( const [name, operations] of Object.entries(selected.features) ) {

        for ( const [operation, wire] of Object.entries(operations) ) {

            if ( !wire.enabled ) continue;

            if ( wire.execution !== "server" ) {

                used.add(wire.connection);
                continue;

            }

            operations[operation] = { enabled: false, restricted: true };

            if ( includes(resourceKeys, name) ) {

                Object.assign(selected.values, { [name]: resourceDefaults(name) });

            }

        }

    }

    return { contract: selected, used };

}
function expose ( connections: ApiConfig["connections"], used: Set<string> ): Record<string, Reachable> {

    const exposed = Object.entries(connections).filter(( [name] ) => used.has(name)).map(( [name, value] ) => {

        const { baseUrl, browser, browserBaseUrl, timeoutMs, retries, maxResponseBytes, credentials } = value;

        return [name, { baseUrl: browser ? browserBaseUrl ?? baseUrl : null, timeoutMs, retries, maxResponseBytes, credentials }];

    });

    return Object.fromEntries(exposed);

}
export function browserConfig ( api: ApiConfig, contract: Contract ): BrowserConfig {

    const { contract: selected, used } = restrict(contract);
    const { authCookie: _, ...context } = api.context;

    return {
        api: { context, connections: expose(api.connections, used), realtime: api.realtime },
        contract: selected,
    };

}
