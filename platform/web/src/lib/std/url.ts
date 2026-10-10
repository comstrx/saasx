import { type Query, queryEntries } from "./route.ts";

const webProtocols = ["http:", "https:"];

function printable ( value: string ): boolean {

    return !/[\\\s]/.test(value) && ![...value].some(( char ) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127);

}
export function parseUrl ( value: string, protocols: readonly string[] = webProtocols ): URL | undefined {

    if ( !printable(value) ) return undefined;

    try {

        const url = new URL(value);

        return protocols.includes(url.protocol) && !url.username && !url.password ? url : undefined;

    }
    catch {

        return undefined;

    }

}
function isLocalPath ( value: string ): boolean {

    return value.startsWith("/") && !value.startsWith("//") && printable(value);

}
export function webUrl ( value: string | null | undefined ): string | undefined {

    if ( !value ) return undefined;

    return isLocalPath(value) || parseUrl(value) ? value : undefined;

}
export function isHref ( value: string ): boolean {

    return isLocalPath(value) || (/^(?:#|mailto:|tel:)/.test(value) && printable(value)) || !!parseUrl(value);

}
export function isEndpoint ( value: string, protocols: readonly string[] = webProtocols ): boolean {

    const url = parseUrl(value, protocols);

    return !!url && !url.search && !url.hash;

}
export function isOrigin ( value: string ): boolean {

    return isEndpoint(value) && new URL(value).pathname === "/";

}
function origin ( value: string ): string {

    if ( !isOrigin(value) ) throw new Error("Expected an HTTP(S) origin without credentials, path, query or fragment.");

    return new URL(value).origin;

}
export function absolute ( base: string, path: string ): string {

    if ( !isLocalPath(path) ) throw new Error("Expected a local absolute path.");

    const site = origin(base);
    const url = new URL(path, site);

    if ( url.origin !== site ) throw new Error("The URL must remain on the site origin.");

    return url.href;

}
export function absoluteHref ( base: string, href: string ): string {

    return isLocalPath(href) ? absolute(base, href) : href;

}
export function safeReturn ( value: string | null | undefined, fallback: string, excluded: readonly string[] = [] ): string {

    if ( !value || !isLocalPath(value) ) return fallback;

    if ( excluded.some(( path ) => value === path || ["/", "?", "#"].some(( mark ) => value.startsWith(`${path}${mark}`))) ) {

        return fallback;

    }

    return value;

}
export function joinUrl ( base: string, path: string, query: Query = {} ): URL {

    const root = new URL(base);
    const prefix = root.pathname.replace(/\/$/, "");
    const url = new URL(root.href.replace(/\/$/, "") + path);

    if ( url.origin !== root.origin || (prefix && !url.pathname.startsWith(`${prefix}/`)) ) {

        throw new TypeError("The path escapes its base URL.");

    }
    for ( const [key, value] of queryEntries(query) ) {

        url.searchParams.append(key, value);

    }

    return url;

}
function valid ( host: string ): boolean {

    return /^[a-z0-9.-]+(?::\d{1,5})?$/.test(host) && !host.startsWith(".") && !host.includes("..");

}
function address ( value: string ): boolean {

    if ( /^(?:\d{1,3}\.){3}\d{1,3}$/.test(value) ) return value.split(".").every(( part ) => Number(part) <= 255);

    return value.includes(":") && value.length <= 45 && /^[0-9a-f:.]+$/i.test(value);

}
function clean ( value: string ): string | undefined {

    const host = value.trim().toLowerCase();

    return valid(host) ? host : undefined;

}
export function hostname ( value: string ): string | undefined {

    return clean(value)?.replace(/:\d+$/, "");

}
export function originOf ( host: string, secure: boolean ): string | undefined {

    const found = clean(host);

    return found && `${secure ? "https" : "http"}://${found}`;

}
export function forwardedFor ( value: string | null | undefined, proxies: number ): string | undefined {

    const chain = (value ?? "").split(",").map(( part ) => part.trim());

    if ( proxies < 1 || proxies > chain.length ) return undefined;

    const found = chain[chain.length - proxies] ?? "";

    return address(found) ? found : undefined;

}

export type Alias = { from: readonly string[]; to: string };

const loopbacks = ["localhost", "127.0.0.1", "[::1]"];

export function loopbackAlias ( origin: string | null | undefined ): Alias | undefined {

    const url = origin ? parseUrl(origin) : undefined;

    if ( !url || !loopbacks.includes(url.hostname) ) return undefined;

    const to = `${url.protocol}//${url.host}`;
    const port = url.port ? `:${url.port}` : "";
    const from = loopbacks.filter(( host ) => host !== url.hostname).map(( host ) => `${url.protocol}//${host}${port}`);

    return { from, to };

}
export function rewriteAlias ( text: string, alias: Alias | undefined ): string {

    if ( !alias ) return text;

    return alias.from.reduce(( current, from ) => current
        .split(from).join(alias.to)
        .split(from.replaceAll("/", "\\/")).join(alias.to.replaceAll("/", "\\/")), text);

}

