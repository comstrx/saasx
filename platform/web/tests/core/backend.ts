import { type ApiClient, createApi, type Execution, type RequestOptions } from "../../src/api/core/client.ts";
import type { ApiConfig, ApiInput } from "../../src/api/core/config.ts";
import { ApiError } from "../../src/api/core/error.ts";
import { requestContext } from "../../src/api/core/request.ts";
import { type ContractOverrides, resolveApi } from "../../src/api/core/resolve.ts";
import type { ApiResult } from "../../src/api/core/response.ts";

export type Reply = { status: number; body: unknown; headers?: Record<string, string> };

export type Recorded = {
    method: string;
    connection: string;
    path: string;
    headers: Record<string, string>;
    idempotent: boolean;
    body: unknown;
};

type Operation = ( input?: unknown, options?: RequestOptions ) => Promise<ApiResult<unknown>>;

export const backend = {
    context: { spec: "client", currency: "USD", authCookie: null, proxies: 1 },
    connections: {
        primary: { baseUrl: "https://api.example.test/v1" },
        broadcast: { baseUrl: "https://api.example.test" },
    },
} satisfies ApiInput;

export const values = { language: "ar", currency: "SAR", auth: "token-1", host: "shop.example.test" };

const volatile = ["idempotency-key", "x-request-id"];
const accepted: Reply = { status: 200, body: { status: true, data: {}, meta: {} } };

function bodyOf ( body: BodyInit | null | undefined ): unknown {

    if ( body === null || body === undefined ) return null;
    if ( body instanceof FormData ) return [...body.entries()].map(( [key, value] ) => [key, typeof value === "string" ? value : `file:${value.name}`]);

    return typeof body === "string" ? JSON.parse(body) : String(body);

}
function locate ( url: string, connections: ApiConfig["connections"] ): { connection: string; path: string } {

    const match = Object.entries(connections).find(( [, value] ) => value.baseUrl && url.startsWith(value.baseUrl));

    if ( !match?.[1].baseUrl ) throw new Error(`Request left every connection: ${url}`);

    return { connection: match[0], path: url.slice(match[1].baseUrl.length) };

}
function record ( input: URL | RequestInfo, init: RequestInit | undefined, connections: ApiConfig["connections"] ): Recorded {

    const headers = [...new Headers(init?.headers)].filter(( [name] ) => !volatile.includes(name));
    const url = input instanceof Request ? input.url : String(input);

    return {
        method: init?.method ?? "GET",
        ...locate(url, connections),
        headers: Object.fromEntries(headers),
        idempotent: new Headers(init?.headers).has("idempotency-key"),
        body: bodyOf(init?.body),
    };

}
export function recorder ( connections: ApiConfig["connections"] ) {

    const calls: Recorded[] = [];
    const state = { reply: accepted };
    const transport: typeof fetch = async ( input, init ) => {

        calls.push(record(input, init, connections));

        return new Response(JSON.stringify(state.reply.body), {
            status: state.reply.status,
            headers: { "content-type": "application/json", ...state.reply.headers },
        });

    };

    return { calls, state, transport };

}
export function coreApi ( overrides: ContractOverrides = {}, input: ApiInput = backend ) {

    return resolveApi(input, overrides);

}
export function harness ( execution: Execution, overrides: ContractOverrides = {}, input: ApiInput = backend ) {

    const { api, contract } = coreApi(overrides, input);
    const recorded = recorder(api.connections);
    const client = createApi(api, contract, requestContext(api.context, values), { execution, transport: recorded.transport });

    return { ...recorded, api, contract, client };

}
export function invoke ( client: ApiClient, feature: string, operation: string, input?: unknown, options?: RequestOptions ) {

    const call = (client as unknown as Record<string, Record<string, Operation>>)[feature]?.[operation];

    if ( !call ) throw new Error(`Unknown operation ${feature}.${operation}.`);

    return call(input, options);

}
export async function attempt ( call: Promise<unknown> ): Promise<string> {

    try {

        await call;

    }
    catch ( error ) {

        return error instanceof ApiError ? error.kind : "unknown";

    }

    return "ok";

}
export function rejected ( run: () => unknown ): ApiError {

    try {

        run();

    }
    catch ( error ) {

        if ( error instanceof ApiError ) return error;

        throw error;

    }

    throw new Error("Expected the call to throw.");

}
export async function failure ( attempt: Promise<unknown> ): Promise<ApiError> {

    try {

        await attempt;

    }
    catch ( error ) {

        if ( error instanceof ApiError ) return error;

        throw error;

    }

    throw new Error("Expected the call to fail.");

}
