import { type Query, queryEntries } from "engine/parse";

export function isOrigin ( value: string ): boolean {

    try {

        const url = new URL(value);

        return ["http:", "https:"].includes(url.protocol) && url.origin === value && !url.username && !url.password;

    } catch {

        return false;

    }

}
export function isEndpoint ( value: string ): boolean {

    try {

        const url = new URL(value);

        return ["http:", "https:"].includes(url.protocol) && !url.search && !url.hash && !url.username && !url.password;

    } catch {

        return false;

    }

}
export function hostname ( host: string ): string | undefined {

    try {

        return new URL(`http://${host}`).hostname || undefined;

    } catch {

        return undefined;

    }

}
export function originOf ( host: string, secure: boolean ): string | undefined {

    try {

        return new URL(`${secure ? "https" : "http"}://${host}`).origin;

    } catch {

        return undefined;

    }

}
export function joinUrl ( base: string, path: string, query: Query = {} ): URL {

    const root = base.endsWith("/") ? base.slice(0, -1) : base;
    const url = new URL(`${root}${path}`);

    for ( const [key, value] of queryEntries(query) ) url.searchParams.append(key, value);

    return url;

}
export function isLoopback ( value: string ): boolean {

    try {

        const { hostname: host } = new URL(value);

        return host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host.endsWith(".localhost");

    } catch {

        return false;

    }

}
export function sameOrigin ( origin: string | null | undefined, host: string, secure: boolean ): boolean {

    if ( !origin || !host ) return false;

    try {

        const url = new URL(origin);

        return url.protocol === (secure ? "https:" : "http:") && url.host === host.toLowerCase();

    } catch {

        return false;

    }

}
