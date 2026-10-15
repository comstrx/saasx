import { pathGet } from "engine/base";

const placeholder = /\{([a-zA-Z0-9_.]+)\}/g;

export type Scope = Readonly<Record<string, unknown>>;

export function textOf ( value: unknown ): string {

    if ( typeof value === "string" ) return value;
    if ( typeof value === "number" || typeof value === "boolean" ) return String(value);

    return "";

}
export function interpolate (
    template: string,
    scope: Scope,
    encode: ( value: string ) => string = ( value ) => value,
): string {

    return template.replace(placeholder, ( _, path: string ) => {

        const found = pathGet(scope, path);

        return found === null || found === undefined ? "" : encode(textOf(found));

    });

}
export function placeholders ( template: string ): string[] {

    return [...template.matchAll(placeholder)].map(( match ) => match[1] ?? "");

}
