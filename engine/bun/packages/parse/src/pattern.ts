import { Failure } from "engine/error";

export type Params = Readonly<Record<string, string>>;

const placeholder = /\{([a-zA-Z][a-zA-Z0-9_]*)\}/g;
const unsafeSegment = /[/%\\?#{}]/;

export function templateKeys ( template: string ): string[] {

    return [...template.matchAll(placeholder)].map(( match ) => match[1] ?? "");

}
export function expandTemplate ( template: string, params: Readonly<Record<string, string | number | boolean>> ): string {

    const path = template.replace(placeholder, ( _: string, key: string ) => {

        const segment = Object.hasOwn(params, key) ? String(params[key]) : "";

        if ( !segment || segment === "." || segment === ".." || /[/%\\]/.test(segment) ) {

            throw new Failure("input", { message: `Invalid path parameter: ${key}` });

        }

        return encodeURIComponent(segment);

    });

    if ( !path.startsWith("/") || path.startsWith("//") || /[\\?#{}]/.test(path) ) {

        throw new Failure("input", { message: "Invalid path template." });

    }

    return path;

}
export function patternKeys ( pattern: string ): string[] {

    return pattern
        .split("/")
        .filter(( part ) => part.startsWith(":"))
        .map(( part ) => part.slice(1));

}
export function matchPattern ( pattern: string, segments: readonly string[] ): Record<string, string> | undefined {

    const parts = pattern.split("/").filter(Boolean);

    if ( parts.length !== segments.length ) return undefined;

    const params: Record<string, string> = {};

    for ( const [index, part] of parts.entries() ) {

        const segment = segments[index] ?? "";

        if ( part.startsWith(":") ) params[part.slice(1)] = segment;
        else if ( part !== segment ) return undefined;

    }

    return params;

}
export function fillPattern ( pattern: string, params: Params ): string {

    const parts = pattern
        .split("/")
        .filter(Boolean)
        .map(( part ) => (part.startsWith(":") ? params[part.slice(1)] : part));

    if ( parts.some(( part ) => !part || unsafeSegment.test(part)) )
        throw new Failure("input", { message: "Invalid path parameter." });

    return `/${parts.join("/")}`;

}
export function segmentsOf ( path: string ): string[] {

    return path.split("/").filter(Boolean);

}
export function entityParam ( id: number, slug?: string | null ): string {

    return slug && /^[a-z0-9][a-z0-9-]*$/.test(slug) ? `${id}-${slug}` : String(id);

}
export function entityId ( value: string | undefined ): number | undefined {

    const match = /^([1-9][0-9]{0,14})(?:-[a-z0-9-]+)?$/.exec(value ?? "");

    return match ? Number(match[1]) : undefined;

}
