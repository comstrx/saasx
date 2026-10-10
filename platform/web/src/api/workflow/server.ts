import "server-only";

import { cookies, headers } from "next/headers";
import { cache } from "react";
import { observeCall } from "../../lib/observe/server.ts";
import { getLocale } from "../../lib/providers/intl-server.ts";
import type { z } from "../../lib/providers/schema.ts";
import { readPreferences } from "../../lib/site/preferences.ts";
import { requestClient, requestHost, requestTrace } from "../../lib/site/request.ts";
import { composeSettings } from "../../lib/site/settings.ts";
import { routing } from "../../lib/spec/config.ts";
import { config } from "../../lib/spec/server.ts";
import { expiring } from "../../lib/std/cache.ts";
import { memoReads, type Transport } from "../../lib/std/fetch.ts";
import { errorFacts, logLine } from "../../lib/std/log.ts";
import { choose } from "../../lib/std/object.ts";
import { type ApiClient, type ApiSurface, createApi, type Result } from "../core/client.ts";
import type { Endpoint } from "../core/dsl.ts";
import { ApiError } from "../core/error.ts";
import { type Context, requestContext, resolveTenant } from "../core/request.ts";
import {
    type EndpointOf, type Endpoints, type Entity, type EntityKind, entities, type Feature, type SitemapKind,
} from "../features/index.ts";

type Read<A extends unknown[], T> = ( api: ApiClient, ...input: A ) => Promise<T>;
type Reading<T> = { boot?: boolean; personal?: boolean } | { boot?: boolean; personal?: boolean; fallback: T };
type Given<E extends Endpoint> = z.input<E["input"]>;
type Input<E extends Endpoint> = Record<string, never> extends Given<E> ? [input?: Given<E>] : [input: Given<E>];

const lifetime = 10000;
const missing = [404, 410];
const values = config.contract.values;
const shared = process.env.FRONT_KEY && process.env.FRONT_SECRET ? basic(`${process.env.FRONT_KEY}:${process.env.FRONT_SECRET}`) : undefined;
const listed = (process.env.FRONT_KEYS ?? "").split(/[\s,]+/).filter(Boolean).map(( entry ) => entry.split("=", 2));
const credentials = new Map(listed.flatMap(( [tenant, pair] ) => (tenant && pair ? [[tenant, basic(pair)] as const] : [])));
const transport = cache(() => memoReads(verdict(fetch)));
const relay: Transport = ( input, init ) => transport()(input, init);

let refused = false;

if ( credentials.size !== listed.length ) {

    logLine("warn", "front.keys.malformed", { expected: "tenant=key:secret", entries: listed.length });

}

function basic ( pair: string ): string {

    return Buffer.from(pair).toString("base64");

}
function front ( tenant: string | undefined ): string | undefined {

    return (tenant && credentials.get(tenant)) || shared;

}
function verdict ( send: Transport ): Transport {

    return async ( input, init ) => {

        const response = await send(input, init);

        if ( !refused && response.headers.get("x-front-verdict") === "refused" ) {

            refused = true;
            logLine("warn", "api.front.refused", { impact: "server-side calls share the web tier's bucket" });

        }

        return response;

    };

}
async function resource<R extends { resource: unknown }> ( pending: Promise<R> ): Promise<R["resource"]> {

    return (await pending).resource;

}
async function codes ( pending: Promise<{ resource: { code?: string | null }[] }> ): Promise<string[]> {

    return (await pending).resource.map(( row ) => row.code ?? "");

}
function connect ( context: () => Promise<Context> ): ApiClient {

    return createApi(config.api, config.contract, context, { transport: relay, observe: observeCall });

}
async function context ( language: string, currency?: string, auth?: string ): Promise<Context> {

    const [host, client, requestId] = await Promise.all([requestHost(), requestClient(), requestTrace()]);
    const tenant = resolveTenant(host);

    return requestContext(config.api.context, { language, currency, host, client, front: front(tenant), auth, requestId });

}
async function load<A extends unknown[], T> ( read: Read<A, T>, input: A, options: Reading<T> ): Promise<T> {

    try {

        return await read(options.boot ? bootApi : publicApi, ...input);

    }
    catch ( error ) {

        if ( !("fallback" in options) ) throw error;
        if ( !(error instanceof ApiError) ) logLine("error", "site.read.failure", errorFacts(error));

        return options.fallback;

    }

}
function settled ( error: unknown ): boolean {

    return error instanceof ApiError && (error.kind === "configuration" || missing.includes(error.status));

}
async function feed ( api: ApiClient, kind: SitemapKind, page: number ) {

    const result = await api.sitemap.list({ kind, page });

    return { rows: result.resource, pages: result.meta.pagination?.pages ?? 1 };

}
export function reader<A extends unknown[], T> ( read: Read<A, T>, options: Reading<T> = {} ) {

    const remember = expiring<T>(lifetime, settled);

    return cache(async ( ...input: A ): Promise<T> => {

        const { tenant, language, currency, auth } = await (options.boot ? bootContext() : serverContext());

        if ( options.personal && auth ) return read(serverApi, ...input);

        return remember(JSON.stringify([tenant, language, currency, ...input]), () => load(read, input, options));

    });

}

export const sitePreferences = cache(async () => {

    const store = await cookies();
    return readPreferences(( name ) => store.get(name)?.value);

});
const bootContext = cache(async () => {

    return context(choose(routing.locales, (await headers()).get("x-locale"), routing.defaultLocale));

});

const bootApi = connect(bootContext);
const readSettings = reader(( api ) => resource(api.settings.read()), { boot: true, fallback: values.settings });
const readLocales = reader(( api ) => codes(api.locales.list({ limit: 100 })), { boot: true, fallback: undefined });

export const readPolicy = reader(( api ) => resource(api.policy.read()), { boot: true, fallback: values.policy });
export const readSitemap = reader(feed, { boot: true });

const readCurrencies = reader(async ( api ) => {

    const rows = await resource(api.currencies.list({ limit: 100 }));

    return rows.filter(( row ) => row.active !== false && row.allow_display !== false).map(( row ) => row.code ?? "");

}, { boot: true, fallback: undefined });

export const siteSettings = cache(async () => {

    const [remote, locales, currencies] = await Promise.all([readSettings(), readLocales(), readCurrencies()]);

    return composeSettings({ remote, local: values.settings, locales, currencies });

});
export const siteCurrency = cache(async () => {

    const [saved, { currency }] = await Promise.all([sitePreferences(), siteSettings()]);

    return choose(currency.enabled, saved.currency, currency.default);

});
export const serverContext = cache(async () => {

    const [store, currency, language] = await Promise.all([cookies(), siteCurrency(), getLocale()]);
    const { authCookie } = config.api.context;

    return context(language, currency, authCookie ? store.get(authCookie)?.value : undefined);

});
const publicContext = cache(async (): Promise<Context> =>
    ({ ...await serverContext(), auth: undefined })
);

export const serverApi = connect(serverContext);
export const publicApi = connect(publicContext);
export const readContent = reader(( api ) => resource(api.content.read()), { fallback: values.content });
export const readPageSeo = reader(( api, page: string ) => resource(api.seo.read({ path: page })));
const readEntityRow = reader(async ( api, kind: EntityKind, id: number ) => (await entities[kind].view(api, id)).resource, { personal: true });

export function readEntity<K extends EntityKind> ( kind: K, id: number ): Promise<Entity<K>> {

    return readEntityRow(kind, id) as Promise<Entity<K>>;

}

const readOperation = reader(( api, key: string ) => {

    const [feature, operation, input] = JSON.parse(key) as [string, string, unknown];
    const call = (api as unknown as ApiSurface)[feature]?.[operation];

    if ( !call ) throw new ApiError("input");

    return call(input);

}, { personal: true });

export function read<F extends Feature, O extends keyof Endpoints[F] & string> (
    feature: F,
    operation: O,
    ...input: Input<EndpointOf<F, O>>
): Promise<Result<EndpointOf<F, O>>> {

    return readOperation(JSON.stringify([feature, operation, input[0] ?? {}])) as Promise<Result<EndpointOf<F, O>>>;

}
