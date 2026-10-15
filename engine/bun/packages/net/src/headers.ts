import { base64, randomBytes } from "engine/base";

export type Directives = Readonly<Record<string, readonly (string | false | null | undefined)[]>>;

export function forwardedFor ( header: string | null, proxies: number ): string | undefined {

    if ( proxies <= 0 || !header ) return undefined;

    const hops = header
        .split(",")
        .map(( part ) => part.trim())
        .filter(Boolean);

    return hops[hops.length - proxies];

}
export function forwarded ( headers: Headers, name: string, proxies: number ): string | undefined {

    return (proxies > 0 && headers.get(name)?.split(",")[0]?.trim()) || undefined;

}
export function nonce ( size = 16 ): string {

    return base64(randomBytes(size));

}
export function contentSecurityPolicy ( directives: Directives ): string {

    return Object.entries(directives)
        .map(( [name, sources] ) =>
            [name, ...sources.filter(( source ) => typeof source === "string" && source.length > 0)].join(" "),
        )
        .join("; ");

}
export function retryAfter ( value: string | null ): number | undefined {

    if ( value === null ) return undefined;

    const seconds = Number(value);

    if ( Number.isFinite(seconds) ) return seconds >= 0 ? seconds : undefined;

    const at = Date.parse(value);

    return Number.isNaN(at) ? undefined : Math.max(0, Math.round((at - Date.now()) / 1000));

}
