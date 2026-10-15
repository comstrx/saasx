import { compact, mapValues } from "engine/base";
import { z } from "engine/validate";
import { type ApiConfig, type ApiInput, apiInputShape, type Connection, connectionDefaults } from "./config.ts";
import type { Catalogue } from "./dsl.ts";
import { resourceShapes } from "./resource.ts";
import {
    type Contract,
    contractShape,
    envelopeDefaults,
    headerDefaults,
    type Layer,
    layerShape,
    merge,
    nameShape,
    type Wire,
    wireShape,
} from "./wire.ts";

const switchShape = z.union([
    z.boolean(),
    layerShape.extend({ operations: z.record(nameShape, z.union([z.boolean(), layerShape])).optional() }),
]);

export const overridesShape = layerShape
    .pick({ execution: true, encoding: true, cache: true, request: true, response: true })
    .extend({ features: z.record(nameShape, switchShape).default({}) });

export type ContractOverrides = z.input<typeof overridesShape>;
export type Seeds = { [R in keyof typeof resourceShapes]?: unknown };
export type Resolved = { api: ApiConfig; contract: Contract };
export type BrowserConfig = { api: ApiConfig; contract: Contract };

type Switch = z.output<typeof switchShape>;
type Overrides = z.output<typeof overridesShape>;

const base: Layer = {
    enabled: true,
    execution: "hybrid",
    encoding: "json",
    cache: 0,
    request: { headers: headerDefaults, fields: {} },
    response: envelopeDefaults,
};

function chosen ( value: Switch | undefined, operation: string ): { enabled: boolean; layer: Layer } {

    if ( value === undefined || value === true ) return { enabled: true, layer: {} };
    if ( value === false ) return { enabled: false, layer: {} };

    const { operations = {}, ...feature } = value;
    const inner = operations[operation];

    if ( inner === false ) return { enabled: false, layer: {} };

    return { enabled: true, layer: merge(feature, inner === true || inner === undefined ? {} : inner) };

}
function wireOf (
    endpoint: Catalogue[string][string],
    core: Layer,
    overrides: Overrides,
    feature: string,
    operation: string,
): Wire | { enabled: false } {

    const { features, ...global } = overrides;
    const selected = chosen(features[feature], operation);
    const own = { method: endpoint.method, path: endpoint.path, ...endpoint.wire };
    const layer = merge(merge(merge(merge(base, core), own), compact(global)), selected.layer);

    if ( !selected.enabled || layer.enabled === false ) return { enabled: false };

    const entries = Object.entries(layer.request?.headers ?? {}).flatMap(( [key, value] ) =>
        value ? [[key, typeof value === "string" ? { name: value } : value]] : [],
    );

    return wireShape.parse({
        ...layer,
        enabled: true,
        request: { ...layer.request, headers: Object.fromEntries(entries), fields: layer.request?.fields ?? {} },
    });

}
function connect ( connection: ApiInput["connections"][string] ): Connection {

    return {
        baseUrl: connection.baseUrl,
        browser: connection.browser ?? connectionDefaults.browser,
        browserBaseUrl: connection.browserBaseUrl ?? connectionDefaults.browserBaseUrl,
        timeoutMs: connection.timeoutMs ?? connectionDefaults.timeoutMs,
        retries: connection.retries ?? connectionDefaults.retries,
        retryOn: connection.retryOn ?? [...connectionDefaults.retryOn],
        maxResponseBytes: connection.maxResponseBytes ?? connectionDefaults.maxResponseBytes,
        credentials: connection.credentials ?? connectionDefaults.credentials,
        ...(connection.development ? { development: connection.development } : {}),
    };

}
function values ( seeds: Seeds ): Contract["values"] {

    return mapValues(
        resourceShapes,
        ( shape, resource ) => shape.parse(seeds[resource as keyof Seeds] ?? {}) as Record<string, unknown>,
    );

}
function strangers ( catalogue: Catalogue, parsed: Overrides ): string[] {

    return Object.entries(parsed.features).flatMap(( [feature, value] ) => {

        const operations = catalogue[feature];

        if ( !operations ) return [`Unknown feature: ${feature}`];

        const asked = typeof value === "object" ? Object.keys(value.operations ?? {}) : [];

        return asked
            .filter(( operation ) => !Object.hasOwn(operations, operation))
            .map(( operation ) => `Unknown operation of ${feature}: ${operation}`);

    });

}
export function resolveApi (
    catalogue: Catalogue,
    input: ApiInput,
    overrides: ContractOverrides,
    seeds: Seeds,
    core: Layer = {},
): Resolved {

    const api = apiInputShape.parse(input);
    const parsed = overridesShape.parse(overrides);
    const unknown = strangers(catalogue, parsed);

    if ( unknown.length ) throw new Error(unknown.join("\n"));

    const coreLayer = layerShape.parse(core);
    const features = mapValues(catalogue, ( operations, feature ) =>
        mapValues(operations, ( endpoint, operation ) => wireOf(endpoint, coreLayer, parsed, feature, operation)),
    );
    const contract = contractShape.parse({ values: values(seeds), features });

    return { api: { context: api.context, connections: mapValues(api.connections, connect) }, contract };

}
export function browserConfig ( api: ApiConfig, contract: Contract ): BrowserConfig {

    const features = mapValues(contract.features, ( operations ) =>
        mapValues(operations, ( wire ) =>
            wire.enabled && wire.execution !== "server" ? wire : { enabled: false as const },
        ),
    );
    const connections = mapValues(api.connections, ( connection ) => ({
        ...connection,
        baseUrl: connection.browser ? (connection.browserBaseUrl ?? connection.baseUrl) : null,
        browserBaseUrl: null,
    }));

    return {
        api: { context: { ...api.context, sessionCookie: null }, connections },
        contract: { values: contract.values, features },
    };

}
