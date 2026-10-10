import { AsyncLocalStorage } from "node:async_hooks";
import { existsSync, statSync } from "node:fs";
import { registerHooks } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { SiteConfig } from "../../src/lib/spec/contract.ts";
import type { SiteSchemaInput } from "../../src/lib/spec/screens.ts";
import { validateSpec } from "../../src/lib/spec/validate.ts";
import { assetFiles } from "../../tools/assets/index.ts";
import { assemble } from "../../tools/compile/index.ts";
import { root } from "../../tools/core/index.ts";
import { dictionaries, minimal } from "./project.ts";

export type Reply = { status: number; body: unknown };
export type Sent = { method: string; url: string; headers: Record<string, string>; cache?: string; next?: unknown };
export type Visit = { locale?: string; headers?: Record<string, string>; cookies?: Record<string, string>; later?: number };

type Jar = { get: ( name: string ) => { name: string; value: string } | undefined; set: ( name: string, value: string ) => void };
type Scope = { locale: string; headers: Headers; cookies: Jar; memo: Map<unknown, Map<string, unknown>>; sent: Sent[] };
type State = {
    spec: Record<string, unknown>;
    request: Scope;
    replies: Record<string, Reply>;
    delay: number;
    clock: number;
    current: () => Scope;
    mounted?: Promise<Awaited<ReturnType<typeof mount>>>;
};

const key = Symbol.for("web.tests.site");
const scopes = new AsyncLocalStorage<Scope>();
const state: State = {
    spec: {},
    request: scope({}),
    replies: {},
    delay: 0,
    clock: 0,
    current: () => scopes.getStore() ?? state.request,
};
const site = `globalThis[Symbol.for("web.tests.site")]`;
const react = pathToFileURL(join(root, "node_modules/react/index.js")).href;
const real: Record<string, string> = { "next/server": pathToFileURL(join(root, "node_modules/next/server.js")).href };
const remembered = [
    "export function cache ( run ) {",
    `    return ( ...input ) => { const memo = ${site}.current().memo; const calls = memo.get(run) ?? new Map(); memo.set(run, calls);`,
    "        const found = JSON.stringify(input); if ( !calls.has(found) ) calls.set(found, run(...input)); return calls.get(found); };",
    "}",
].join("\n");
const virtual: Record<string, string> = {
    "server-only": "export {};",
    "@spec/theme.css": "export {};",
    "next/headers": `export const headers = async () => ${site}.current().headers;\nexport const cookies = async () => ${site}.current().cookies;`,
    "next/navigation": [
        "export function notFound () { throw Object.assign(new Error(\"not found\"), { digest: \"NEXT_HTTP_ERROR_FALLBACK;404\" }); }",
        "export function permanentRedirect ( url ) { throw Object.assign(new Error(\"redirect \" + url), { digest: \"NEXT_REDIRECT\" }); }",
    ].join("\n"),
    "next-intl/server": [
        `export const getLocale = async () => ${site}.current().locale;`,
        "export const getMessages = async () => ({});",
        "export const getTranslations = async () => (( name ) => name);",
        "export const getRequestConfig = ( make ) => make;",
    ].join("\n"),
    react: `export * from "${react}";\n${remembered}`,
};

function scope ( { locale = "en", headers = {}, cookies = {} }: Visit ): Scope {

    return {
        locale,
        headers: new Headers({ host: "shop.example.test", "x-locale": locale, "x-request-id": "trace", ...headers }),
        cookies: jar(cookies),
        memo: new Map(),
        sent: [],
    };

}
function jar ( cookies: Record<string, string> ): Jar {

    const held = new Map(Object.entries(cookies));

    return {
        get: ( name ) => (held.has(name) ? { name, value: held.get(name) ?? "" } : undefined),
        set: ( name, value ) => { held.set(name, value); },
    };

}
function probe ( base: string ): string | undefined {

    const found = [base, `${base}.ts`, `${base}.tsx`, join(base, "index.ts")].find(( path ) => existsSync(path) && statSync(path).isFile());

    return found ? pathToFileURL(found).href : undefined;

}
function locate ( specifier: string, parent: string | undefined ): string | undefined {

    if ( Object.hasOwn(real, specifier) ) return real[specifier];
    if ( Object.hasOwn(virtual, specifier) || specifier.startsWith("@spec/") ) return `virtual:${specifier}`;
    if ( specifier.startsWith("@/") ) return probe(join(root, "src", specifier.slice(2)));

    const local = parent?.startsWith("file:") && !parent.includes("/node_modules/") && specifier.startsWith(".");

    return local && !/\.[a-z]+$/.test(specifier) ? probe(resolve(dirname(fileURLToPath(parent ?? "")), specifier)) : undefined;

}
function source ( name: string ): string {

    return virtual[name] ?? `export default ${site}.spec[${JSON.stringify(name.slice("@spec/".length))}];`;

}
async function transport ( input: URL | RequestInfo, init: RequestInit & { next?: unknown } = {} ): Promise<Response> {

    const url = new URL(input instanceof Request ? input.url : String(input));
    const address = `${url.pathname}${url.search}`;
    const headers = Object.fromEntries([...new Headers(init.headers)].sort());
    const reply = state.replies[address] ?? state.replies[url.pathname];

    state.current().sent.push({ method: init.method ?? "GET", url: address, headers, cache: init.cache, next: init.next });

    if ( state.delay ) await new Promise(( settle ) => setTimeout(settle, state.delay));
    if ( !reply ) throw new TypeError("fetch failed", { cause: new Error("connect ECONNREFUSED") });

    return new Response(JSON.stringify(reply.body), { status: reply.status, headers: { "content-type": "application/json" } });

}
export function answer ( data: unknown, meta: Record<string, unknown> = {} ): Reply {

    return { status: 200, body: { status: true, code: "ok", message: "operation completed", data, meta } };

}
export function refusal ( status: number ): Reply {

    return { status, body: { status: false, code: "error", reason: "failed", message: "operation failed", data: null } };

}
export function backend ( replies: Record<string, Reply> ): void {

    state.replies = replies;

}
export function visit ( { later = 60000, ...options }: Visit = {} ): Sent[] {

    state.clock += later;
    state.request = scope(options);

    return state.request.sent;

}
export function concurrently ( options: Visit, slow = 0 ) {

    const request = scope(options);

    state.delay = slow;

    return { sent: request.sent, run: <T> ( work: () => Promise<T> ): Promise<T> => scopes.run(request, work).finally(() => { state.delay = 0; }) };

}
export function serialize ( value: unknown ): string {

    return `${JSON.stringify(value, null, 4)}\n`;

}
export async function mount ( config: SiteConfig, schema: SiteSchemaInput, mode: "development" | "production" = "production" ) {

    const folder = resolve(root, "public");
    const spec = { ...validateSpec(config, schema, dictionaries), messages: dictionaries, identity: "r", folder };
    const clock = Date.now.bind(Date);

    state.spec = assemble(spec, assetFiles(folder, true), mode).data;
    Object.assign(globalThis, { [key]: state, fetch: transport });
    Object.assign(process.env, { NODE_ENV: mode, NEXT_PUBLIC_SPEC: spec.identity });
    Date.now = () => clock() + state.clock;

    registerHooks({
        resolve: ( specifier, context, next ) => {

            const url = locate(specifier, context.parentURL);

            return url ? { url, shortCircuit: true, format: url.startsWith("virtual:") ? "module" : undefined } : next(specifier, context);

        },
        load: ( url, context, next ) => (url.startsWith("virtual:") ? { format: "module", shortCircuit: true, source: source(url.slice(8)) } : next(url, context)),
    });
    visit();

    return {
        server: await import("../../src/api/workflow/server.ts"),
        seo: await import("../../src/lib/seo/index.ts"),
        spec: await import("../../src/lib/spec/server.ts"),
    };

}

export function runtime (): Promise<Awaited<ReturnType<typeof mount>>> {

    state.mounted ??= mount({ ...minimal, contracts: { ...minimal.contracts, options: { ...minimal.contracts.options, authCookie: "session" } } }, { screens: [] });

    return state.mounted;

}
