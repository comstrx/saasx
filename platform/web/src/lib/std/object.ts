
export type Dictionary = Record<string, unknown>;
export type Present<T> = { [K in keyof T]: null extends T[K] ? Exclude<T[K], null> | undefined : T[K] };

const unsafeKeys: readonly string[] = ["__proto__", "prototype", "constructor"];

export function isRecord ( value: unknown ): value is Dictionary {

    return value !== null && typeof value === "object" && !Array.isArray(value);

}
export function isScalar ( value: unknown ): value is string | number | boolean {

    return typeof value === "string" || typeof value === "number" || typeof value === "boolean";

}
export function safeKey ( key: string ): boolean {

    return key.length > 0 && !unsafeKeys.includes(key);

}
export function keysOf<T extends object> ( value: T ): (keyof T & string)[] {

    return Object.keys(value) as (keyof T & string)[];

}
export function present<T extends object> ( value: T ): Present<T> {

    return Object.fromEntries(Object.entries(value).map(( [key, item] ) => [key, item ?? undefined])) as Present<T>;

}
export function compact<T extends object> ( value: T | undefined ): Partial<T> {

    return Object.fromEntries(Object.entries(value ?? {}).filter(( [, item] ) => item !== undefined)) as Partial<T>;

}
export function filterKeys<T> ( value: Readonly<Record<string, T>>, keep: ( key: string ) => boolean ): Record<string, T> {

    return Object.fromEntries(Object.entries(value).filter(( [key] ) => keep(key)));

}
export function mapValues<T, R> ( value: Readonly<Record<string, T>>, map: ( item: T, key: string ) => R ): Record<string, R> {

    return Object.fromEntries(Object.entries(value).map(( [key, item] ) => [key, map(item, key)]));

}
export function pathGet ( value: unknown, path: string ): unknown {

    if ( path === "$" ) return value;

    let node = value;

    for ( const key of path.split(".") ) {

        if ( !node || typeof node !== "object" || !Object.hasOwn(node, key) ) return undefined;

        node = (node as Dictionary)[key];

    }

    return node;

}
export function pathSet ( target: Dictionary, path: string, value: unknown ): void {

    const keys = path.split(".");
    const last = keys.pop();
    let node = target;

    if ( last === undefined || !keys.every(safeKey) || !safeKey(last) ) {

        throw new TypeError(`Unsafe object path: ${path}`);

    }
    for ( const key of keys ) {

        if ( !Object.hasOwn(node, key) ) node[key] = {};

        const next = node[key];

        if ( !isRecord(next) ) throw new TypeError(`Object path collides with a value: ${path}`);

        node = next;

    }

    node[last] = value;

}
export function includes<T extends string> ( values: readonly T[], value: unknown ): value is T {

    return typeof value === "string" && values.some(( candidate ) => candidate === value);

}
export function choose<T extends string> ( values: readonly T[], value: unknown, fallback: T ): T {

    return includes(values, value) ? value : fallback;

}
