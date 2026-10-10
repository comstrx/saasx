
export type QueryValue = string | number | boolean;
export type QueryInput = QueryValue | null | undefined | readonly QueryInput[] | { readonly [key: string]: QueryInput };
export type Query = Readonly<Record<string, QueryInput>>;
type Pagination = { page?: number | null; limit?: number | null; total?: number | null; paged?: boolean | null };

const placeholder = /\{([a-zA-Z][a-zA-Z0-9_]*)\}/g;

export function templateKeys ( template: string ): string[] {

    return [...template.matchAll(placeholder)].map(( match ) => match[1] ?? "");

}
export function expandPath ( template: string, params: Readonly<Record<string, QueryValue>> ): string {

    const path = template.replace(placeholder, ( _: string, key: string ) => {

        const segment = Object.hasOwn(params, key) ? String(params[key]) : "";

        if ( !segment || segment === "." || segment === ".." || /[/%\\]/.test(segment) ) {

            throw new TypeError(`Invalid path parameter: ${key}`);

        }

        return encodeURIComponent(segment);

    });

    if ( !path.startsWith("/") || path.startsWith("//") || /[\\?#{}]/.test(path) ) throw new TypeError("Invalid path template.");

    return path;

}
export function matchPath ( pattern: string, segments: readonly string[] ): Record<string, string> | undefined {

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
export function patternKeys ( pattern: string ): string[] {

    return pattern.split("/").filter(( part ) => part.startsWith(":")).map(( part ) => part.slice(1));

}
export function fillPattern ( pattern: string, params: Readonly<Record<string, string>> ): string {

    const parts = pattern.split("/").filter(Boolean).map(( part ) => (part.startsWith(":") ? params[part.slice(1)] : part));

    if ( parts.some(( part ) => !part || /[/\\?#%]/.test(part)) ) throw new TypeError("Invalid path parameter.");

    return `/${parts.join("/")}`;

}
export function entityParam ( id: number, slug?: string | null ): string {

    return slug && /^[a-z0-9][a-z0-9-]*$/.test(slug) ? `${id}-${slug}` : String(id);

}
export function entityId ( value: string | undefined ): number | undefined {

    const match = /^([1-9][0-9]{0,14})(?:-[a-z0-9-]+)?$/.exec(value ?? "");

    return match ? Number(match[1]) : undefined;

}
function entries ( key: string, value: QueryInput, depth: number ): [string, string][] {

    if ( depth > 4 ) throw new TypeError(`Query nests too deeply: ${key}`);
    if ( value === null || value === undefined ) return [];
    if ( Array.isArray(value) ) return value.flatMap(( item ) => entries(`${key}[]`, item, depth + 1));

    if ( typeof value === "object" ) {

        return Object.entries(value).flatMap(( [name, item] ) => entries(`${key}[${name}]`, item, depth + 1));

    }

    return [[key, String(value)]];

}
export function isQuery ( value: unknown, depth = 0 ): value is QueryInput {

    if ( value === null || value === undefined || ["string", "number", "boolean"].includes(typeof value) ) return depth <= 4;
    if ( Array.isArray(value) ) return value.every(( item ) => isQuery(item, depth + 1));

    return typeof value === "object" && Object.values(value).every(( item ) => isQuery(item, depth + 1));

}
export function queryEntries ( query: Query ): [string, string][] {

    return Object.entries(query).flatMap(( [key, value] ) => entries(key, value, 0));

}
export function searchHref ( path: string, values: Query, patch: Query = {} ): string {

    const params = new URLSearchParams(queryEntries({ ...values, ...patch }).filter(( [, value] ) => value !== ""));

    return `${path}${params.size ? `?${params}` : ""}`;

}
export function hasNextPage ( pagination: Pagination | undefined, count: number, limit: number ): boolean {

    if ( pagination?.paged === false ) return false;
    if ( pagination?.total == null ) return count >= limit;

    return (pagination.page ?? 1) * (pagination.limit ?? limit) < pagination.total;

}
