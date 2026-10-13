import "server-only";

import type { Endpoint } from "@engine/api";
import { type ApiClient, type Context, createApi, type Result, requestContext } from "@engine/api";
import { remember } from "@engine/cache";
import { Failure, settled } from "@engine/error";
import type { z } from "@engine/validate";
import { cookies } from "next/headers";
import { cache } from "react";
import { observeCall } from "../../lib/observe/server.ts";
import { readPreferences } from "../../lib/site/preferences.ts";
import { requestClient, requestHost, requestLocale, requestTrace } from "../../lib/site/request.ts";
import { config } from "../../lib/spec/server.ts";
import { type EndpointOf, type Endpoints, endpoints, type Feature, type OperationOf } from "../features/index.ts";

type Given<E extends Endpoint> = z.input<E["input"]>;

const lifetime = 10000;
const kept = remember<unknown>(lifetime, settled);
const connections = config.api?.connections ?? {};
const currency = config.api?.context.currency ?? config.settings.currency.default;

export const serverContext = cache(async (): Promise<Context> => {

    const [host, client, requestId, language, store] = await Promise.all([requestHost(), requestClient(), requestTrace(), requestLocale(), cookies()]);
    const saved = readPreferences(( name ) => store.get(name)?.value);
    const cookie = config.api?.context.sessionCookie;
    const auth = cookie ? store.get(cookie)?.value : undefined;

    return requestContext({ currency, tenant: config.api?.context.tenant ?? null }, { language, currency: saved.currency, host, client, auth, requestId });

});
const caching = ( lifetime: number ): Record<string, unknown> => (lifetime ? { cache: "force-cache", next: { revalidate: lifetime } } : { cache: "no-store" });

export const publicApi: ApiClient<Endpoints> = createApi(endpoints, { connections }, config.contract, serverContext, { execution: "server", observe: observeCall, caching });

export const read = cache(async <F extends Feature, O extends OperationOf<F>> ( feature: F, operation: O, input?: Given<EndpointOf<F, O>> ): Promise<Result<EndpointOf<F, O>>> => {

    const context = await serverContext();
    const call = (publicApi[feature] as Record<string, ( value?: unknown ) => Promise<unknown>>)[operation];

    if ( !call ) throw new Failure("input", { message: `Unknown operation ${feature}.${operation}.` });
    if ( context.auth ) return call(input) as Promise<Result<EndpointOf<F, O>>>;

    const key = JSON.stringify([context.tenant, context.language, context.currency, feature, operation, input ?? {}]);

    return kept(key, () => call(input)) as Promise<Result<EndpointOf<F, O>>>;

});
export const siteContent = cache(async () => {

    try { return (await read("site", "read")).resource; }
    catch { return config.content; }

});
