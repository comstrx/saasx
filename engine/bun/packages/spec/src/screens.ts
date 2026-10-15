import type { ApiSurface } from "engine/api";
import { isRecord, mapValues, pathGet } from "engine/base";
import { matchPattern } from "engine/parse";
import { type Messages, messageAt, messageTree } from "engine/translate";
import { isSpecKey, type Localized, type SpecText } from "./fields.ts";
import type { PortSource } from "./ports.ts";
import type { CompiledPort } from "./shapes.ts";

export type Routed<S> = S & { pattern: string; parameters: Record<string, string> };
export type Held = { permissions: readonly string[] } | null | undefined;

export function matchScreen<S extends { path: string }> (
    screens: readonly S[],
    segments: readonly string[],
): Routed<S> | undefined {

    const path = `/${segments.join("/")}`;
    const exact = screens.find(( screen ) => screen.path === path);
    const candidates = exact ? [exact] : screens.filter(( screen ) => screen.path.includes(":"));

    for ( const screen of candidates ) {

        const parameters = matchPattern(screen.path, segments);

        if ( parameters ) return { ...screen, pattern: screen.path, path, parameters };

    }

    return undefined;

}
export function messageText ( value: SpecText, messages: Messages, locale: string ): string {

    if ( typeof value === "string" ) return value;

    const found = messageAt(messages, value.key);

    if ( found === undefined ) throw new Error(`Missing ${locale} message: ${value.key}`);

    return found;

}
export function localizeTree<T> ( value: T, messages: Messages, locale: string ): Localized<T> {

    const walk = ( item: unknown ): unknown => {

        if ( isSpecKey(item) ) return messageTree(messages, item.key) ?? messageText(item, messages, locale);
        if ( Array.isArray(item) ) return item.map(walk);
        if ( isRecord(item) ) return mapValues(item, walk);

        return item;

    };

    return walk(value) as Localized<T>;

}
export function granted ( held: Held, access: readonly string[] ): boolean {

    if ( !held ) return false;

    return access.every(( permission ) => permission === "user" || held.permissions.includes(permission));

}
export function portSource ( api: ApiSurface, site: () => Promise<unknown> | unknown ): PortSource {

    return {
        read: async ( feature, operation, input, _many, signal ) => {

            const call = api[feature]?.[operation];

            if ( !call ) throw new Error(`No operation ${feature}.${operation} in the catalogue.`);

            const result = await call(input, { signal });

            return { value: result.resource, pagination: result.meta.pagination };

        },
        site: async ( path ) => {

            const document = await site();

            return path === "$" ? document : pathGet(document, path);

        },
    };

}
export function localPort (
    port: CompiledPort | undefined,
    site: unknown,
): { local: true; value: unknown } | { local: false } {

    if ( !port || port.kind === "write" ) return { local: true, value: undefined };
    if ( port.kind === "data" ) return { local: true, value: port.value };
    if ( port.kind === "site" ) return { local: true, value: port.path === "$" ? site : pathGet(site, port.path) };

    return { local: false };

}
