import { type ApiSurface, createSurface, type Execution } from "../../src/api/core/client.ts";
import type { ApiConfig } from "../../src/api/core/config.ts";
import type { Endpoint } from "../../src/api/core/dsl.ts";
import { requestContext } from "../../src/api/core/request.ts";
import type { Contract } from "../../src/api/core/wire.ts";
import { endpoints } from "../../src/api/features/index.ts";
import { retryAfter } from "../../src/lib/std/fetch.ts";
import { parseJson } from "../../src/lib/std/json.ts";
import { isRecord } from "../../src/lib/std/object.ts";
import { delay } from "../../src/lib/std/timing.ts";
import { calls } from "../../tests/api/calls.ts";
import { coreContract, type Sample, type Samples, type Target } from "./verify.ts";

type Session = { api: ApiConfig; contract: Contract; tenant: string; auth?: string; last?: Sample };
type Source = readonly [feature: string, operation: string, field?: string];
type Recorded = { samples: Samples; skipped: string[] };

const catalogue: Record<string, Record<string, Endpoint>> = endpoints;
const examples = new Map(calls.map(( [feature, operation, input] ) => [`${feature}.${operation}`, input]));

const sources: Readonly<Record<string, Source>> = {
    productId: ["products", "list"],
    categoryId: ["categories", "list"],
    articleId: ["articles", "list"],
    offerId: ["offers", "list"],
    campaignId: ["campaigns", "list"],
    planId: ["plans", "list"],
    vendorId: ["vendors", "list"],
    geoId: ["geos", "list"],
    countryId: ["countries", "list"],
    regionId: ["regions", "list"],
    cityId: ["cities", "list"],
    districtId: ["districts", "list"],
    poiId: ["pois", "list"],
    levelId: ["levels", "list"],
    rewardId: ["rewards", "list"],
    couponId: ["coupons", "list"],
    notificationId: ["notifications", "list"],
    ticketId: ["tickets", "list"],
    orderId: ["orders", "list"],
    cartId: ["cart", "list"],
    favoriteId: ["favorites", "list"],
    transactionId: ["transactions", "list"],
    subscriptionId: ["subscriptions", "list"],
    tenantId: ["tenants", "list"],
    gatewayId: ["gateways", "list"],
    sessionId: ["sessions", "list"],
    roomId: ["chat", "rooms"],
    logId: ["logs", "list"],
    reportId: ["reports", "list"],
    reviewId: ["reviews", "list"],
    commentId: ["comments", "list"],
    referralId: ["referrals", "list"],
    slug: ["products", "list", "slug"],
};

async function patient ( input: URL | RequestInfo, init: RequestInit | undefined ): Promise<Response> {

    const request: RequestInit = { ...init, signal: undefined, cache: undefined, next: undefined };

    for ( let attempt = 0; ; attempt += 1 ) {

        const response = await fetch(input, request);

        if ( response.status !== 429 || attempt >= 4 ) return response;

        await delay((retryAfter(response.headers.get("retry-after")) ?? 30) * 1000 + 500);

    }

}
function capture ( session: Session ): typeof fetch {

    return async ( input, init ) => {

        const response = await patient(input, init);
        const text = await response.text();
        const empty = [204, 205, 304].includes(response.status);
        const headers = { "content-type": response.headers.get("content-type") ?? "" };

        session.last = { status: response.status, body: empty ? null : parseJson(text) };

        return new Response(empty ? null : text, { status: response.status, headers });

    };

}
function surface ( session: Session, execution: Execution ): ApiSurface {

    const context = requestContext(session.api.context, { language: "en", currency: "USD", host: session.tenant, auth: session.auth });

    return createSurface(session.api, session.contract, context, { execution, transport: capture(session) });

}
async function invoke ( session: Session, feature: string, operation: string, input: unknown ): Promise<unknown> {

    const wire = session.contract.features[feature]?.[operation];
    const execution = wire?.enabled && wire.execution === "client" ? "client" : "server";
    const call = surface(session, execution)[feature]?.[operation];

    if ( !call ) throw new Error(`Unknown operation ${feature}.${operation}.`);

    return (await call(input)).resource;

}
async function authenticate ( session: Session, otp: string ): Promise<string> {

    const stamp = Date.now().toString(36);
    const password = `Contract-${stamp}!9`;
    const person = { name: "Contract Probe", email: `contract.${stamp}@example.test`, phone: `+9665${String(Date.now()).slice(-8)}` };
    const reply = await invoke(session, "auth", "register", { ...person, password, password_confirmation: password });
    const challenge = isRecord(reply) && typeof reply.challenge_token === "string" ? reply.challenge_token : undefined;
    const verified = challenge ? await invoke(session, "auth", "verify", { challenge_token: challenge, otp }) : reply;
    const token = isRecord(verified) ? verified.token : undefined;

    if ( typeof token !== "string" ) throw new Error("The probe account did not get a session token.");

    return token;

}
function first ( rows: unknown, field: string ): number | string | undefined {

    const values = (Array.isArray(rows) ? rows : []).map(( row ) => isRecord(row) ? row[field] : undefined);

    return values.find(( value ) => typeof value === "number" || (typeof value === "string" && value.length > 0)) as number | string | undefined;

}
async function harvest ( session: Session ): Promise<Record<string, number | string>> {

    const found: Record<string, number | string> = {};

    for ( const [parameter, [feature, operation, field = "id"]] of Object.entries(sources) ) {

        const value = first(await invoke(session, feature, operation, {}).catch(() => []), field);

        if ( value !== undefined ) found[parameter] = value;

    }

    return found;

}
function inputOf ( endpoint: Endpoint, call: string, harvested: Record<string, number | string> ): Record<string, unknown> | string {

    const shape: Record<string, { safeParse: ( value: unknown ) => { success: boolean } }> = endpoint.input.shape;
    const keys = Object.keys(shape);
    const example = examples.get(call);
    const required = Object.entries(isRecord(example) ? example : {}).filter(( [key] ) => !shape[key]?.safeParse(undefined).success);
    const input: Record<string, unknown> = Object.fromEntries(required);
    const missing = keys.filter(( key ) => Object.hasOwn(sources, key) && harvested[key] === undefined);

    if ( missing.length ) return `no live ${missing.join(", ")}`;

    for ( const key of keys ) {

        if ( Object.hasOwn(sources, key) ) input[key] = harvested[key];

    }
    if ( keys.includes("limit") ) input.limit = 2;
    if ( keys.includes("page") ) input.page = 1;

    return input;

}
function trimmed ( value: unknown ): unknown {

    if ( Array.isArray(value) ) return value.slice(0, 2).map(trimmed);

    return isRecord(value) ? Object.fromEntries(Object.entries(value).map(( [key, item] ) => [key, trimmed(item)])) : value;

}
function renditions ( endpoint: Endpoint, call: string, input: Record<string, unknown> ): [string, Record<string, unknown>][] {

    return Object.hasOwn(endpoint.input.shape, "view") ? [[call, input], [`${call}#tiny`, { ...input, view: "tiny" }]] : [[call, input]];

}
function reply ( session: Session ): Sample | undefined {

    return session.last;

}
async function record ( session: Session, call: string, input: Record<string, unknown> ): Promise<Sample | string> {

    const [feature = "", operation = ""] = (call.split("#")[0] ?? "").split(".");

    session.last = undefined;

    try {

        await invoke(session, feature, operation, input);

    }
    catch ( error ) {

        const last = reply(session);

        if ( !last || last.status >= 300 ) return `${last?.status ?? "no reply"}: ${String(error)}`;

    }

    const last = reply(session);

    return last && last.status < 300 ? { status: last.status, body: trimmed(last.body) } : "no reply";

}
async function collect ( session: Session, recorded: Recorded, variants: [string, Record<string, unknown>][] ): Promise<void> {

    for ( const [name, input] of variants ) {

        const outcome = await record(session, name, input);

        if ( typeof outcome === "object" ) recorded.samples[name] = outcome;
        else recorded.skipped.push(`${name}: ${outcome}`);

    }

}
export async function recordSamples ( target: Target, otp: string ): Promise<Recorded> {

    const session: Session = { ...coreContract(target), tenant: target.tenant };
    const recorded: Recorded = { samples: {}, skipped: [] };

    session.auth = await authenticate(session, otp);

    const harvested = await harvest(session);

    for ( const [feature, operations] of Object.entries(catalogue) ) {

        for ( const [operation, endpoint] of Object.entries(operations) ) {

            const call = `${feature}.${operation}`;
            const input = endpoint.method === "GET" ? inputOf(endpoint, call, harvested) : undefined;

            if ( typeof input === "string" ) recorded.skipped.push(`${call}: ${input}`);
            if ( typeof input !== "object" ) continue;

            await collect(session, recorded, renditions(endpoint, call, input));

        }

    }

    return recorded;

}
