import { Failure } from "engine/error";

export type QueryValue = string | number | boolean;
export type QueryInput = QueryValue | null | undefined | readonly QueryInput[] | { readonly [key: string]: QueryInput };
export type Query = Readonly<Record<string, QueryInput>>;

const depthLimit = 4;

function entries ( key: string, value: QueryInput, depth: number ): [string, string][] {

    if ( depth > depthLimit ) throw new Failure("input", { message: `Query nests too deeply: ${key}` });
    if ( value === null || value === undefined ) return [];
    if ( Array.isArray(value) ) return value.flatMap(( item ) => entries(`${key}[]`, item, depth + 1));

    if ( typeof value === "object" ) {

        return Object.entries(value).flatMap(( [name, item] ) => entries(`${key}[${name}]`, item, depth + 1));

    }

    return [[key, String(value)]];

}
export function isQuery ( value: unknown, depth = 0 ): value is QueryInput {

    if ( value === null || value === undefined || ["string", "number", "boolean"].includes(typeof value) )
        return depth <= depthLimit;

    if ( Array.isArray(value) ) return value.every(( item ) => isQuery(item, depth + 1));

    return typeof value === "object" && Object.values(value).every(( item ) => isQuery(item, depth + 1));

}
export function queryEntries ( query: Query ): [string, string][] {

    return Object.entries(query).flatMap(( [key, value] ) => entries(key, value, 0));

}
export function queryString ( query: Query ): string {

    const params = new URLSearchParams(queryEntries(query).filter(( [, value] ) => value !== ""));

    return params.size ? `?${params}` : "";

}
export function parseQuery ( search: string ): Record<string, string | string[]> {

    const result: Record<string, string | string[]> = {};

    for ( const [key, value] of new URLSearchParams(search.startsWith("?") ? search.slice(1) : search) ) {

        const name = key.endsWith("[]") ? key.slice(0, -2) : key;
        const current = result[name];

        if ( key.endsWith("[]") || current !== undefined ) {

            result[name] = [...(Array.isArray(current) ? current : current === undefined ? [] : [current]), value];

        } else {

            result[name] = value;

        }

    }

    return result;

}
