import type { Store } from "engine/storage";

export type SameSite = "lax" | "strict" | "none";
export type CookieOptions = {
    path?: string | undefined;
    domain?: string | undefined;
    maxAge?: number | undefined;
    expires?: Date | undefined;
    httpOnly?: boolean | undefined;
    secure?: boolean | undefined;
    sameSite?: SameSite | undefined;
};

export type Jar = {
    get: ( name: string ) => Promise<string | undefined> | string | undefined;
    set: ( name: string, value: string, options?: CookieOptions ) => Promise<void> | void;
    delete: ( name: string, options?: Pick<CookieOptions, "path" | "domain"> ) => Promise<void> | void;
    all: () => Promise<Record<string, string>> | Record<string, string>;
};
export type ReadableDocument = { cookie: string };

const name = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;

export function parseCookies ( header: string | null | undefined ): Record<string, string> {

    const result: Record<string, string> = {};

    for ( const part of (header ?? "").split(";") ) {

        const index = part.indexOf("=");

        if ( index === -1 ) continue;

        const key = part.slice(0, index).trim();
        const value = part.slice(index + 1).trim();

        if ( key && name.test(key) && !Object.hasOwn(result, key) ) {

            try {

                result[key] = decodeURIComponent(value);

            } catch {

                result[key] = value;

            }

        }

    }

    return result;

}
export function serializeCookie ( key: string, value: string, options: CookieOptions = {} ): string {

    if ( !name.test(key) ) throw new Error(`Invalid cookie name: ${key}`);

    const parts = [`${key}=${encodeURIComponent(value)}`];

    if ( options.maxAge !== undefined ) parts.push(`Max-Age=${Math.floor(options.maxAge)}`);
    if ( options.expires ) parts.push(`Expires=${options.expires.toUTCString()}`);
    if ( options.domain ) parts.push(`Domain=${options.domain}`);

    parts.push(`Path=${options.path ?? "/"}`);

    if ( options.httpOnly ) parts.push("HttpOnly");
    if ( options.secure ) parts.push("Secure");
    if ( options.sameSite ) parts.push(`SameSite=${options.sameSite[0]?.toUpperCase()}${options.sameSite.slice(1)}`);

    return parts.join("; ");

}
export function headerJar ( cookieHeader: string | null | undefined, write: ( setCookie: string ) => void ): Jar {

    const current = parseCookies(cookieHeader);

    return {
        get: ( key ) => current[key],
        set: ( key, value, options ) => {

            current[key] = value;
            write(serializeCookie(key, value, options));

        },
        delete: ( key, options ) => {

            delete current[key];
            write(serializeCookie(key, "", { ...options, maxAge: 0, expires: new Date(0) }));

        },
        all: () => ({ ...current }),
    };

}
export function documentJar ( target: ReadableDocument ): Jar {

    return {
        get: ( key ) => parseCookies(target.cookie)[key],
        set: ( key, value, options ) => {

            const { httpOnly: _ignored, ...allowed } = options ?? {};

            target.cookie = serializeCookie(key, value, allowed);

        },
        delete: ( key, options ) => {

            target.cookie = serializeCookie(key, "", { ...options, maxAge: 0, expires: new Date(0) });

        },
        all: () => parseCookies(target.cookie),
    };

}
export function storageJar ( store: Store ): Jar {

    type Kept = { value: string; expires: number | null };

    const read = async ( key: string ): Promise<Kept | undefined> => {

        const text = await store.get(key);

        if ( text === null ) return undefined;

        try {

            const kept = JSON.parse(text) as Kept;

            if ( kept.expires !== null && kept.expires <= Date.now() ) {

                await store.delete(key);

                return undefined;

            }

            return kept;

        } catch {

            await store.delete(key);

            return undefined;

        }

    };

    return {
        get: async ( key ) => (await read(key))?.value,
        set: async ( key, value, options ) => {

            const expires =
                options?.expires?.getTime() ??
                (options?.maxAge !== undefined ? Date.now() + options.maxAge * 1000 : null);

            await store.set(key, JSON.stringify({ value, expires } satisfies Kept));

        },
        delete: async ( key ) => {

            await store.delete(key);

        },
        all: async () => {

            const entries = await Promise.all(
                (await store.keys()).map(async ( key ) => [key, (await read(key))?.value] as const),
            );

            return Object.fromEntries(
                entries.filter(( entry ): entry is readonly [string, string] => entry[1] !== undefined),
            );

        },
    };

}
