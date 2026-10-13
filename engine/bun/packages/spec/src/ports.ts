import { isRecord, pathGet } from "@engine/base";
import type { CompiledPort, Input } from "./shapes.ts";

export type Route = {
    parameters: Record<string, string>;
    query: Record<string, string | string[] | undefined>;
    signals?: Record<string, unknown> | undefined;
};
export type Pagination = {
    page: number | null;
    limit: number | null;
    total: number | null;
    pages: number | null;
};
export type PortAnswer = { value: unknown; pagination?: Pagination | undefined };
export type Reader = (
    feature: string,
    operation: string,
    input: Record<string, unknown>,
    many: boolean,
    signal?: AbortSignal | undefined,
) => Promise<PortAnswer> | PortAnswer;
export type PortSource = { read: Reader; site: ( path: string ) => Promise<unknown> | unknown };
export type Rows = Record<string, unknown>[];
export type Placement = { id: string; slug: string; heading: boolean; access: string[] };
export type FeatureProps<O, S, N> = {
    options: O;
    ports: Record<string, CompiledPort>;
    screen: S;
    route: Route;
    feature?: Placement | undefined;
    children?: N | undefined;
};

export function fillInput ( input: Input, route: Route ): Record<string, unknown> {

    return Object.fromEntries(
        Object.entries(input).map(( [name, value] ) => {

            if ( isRecord(value) && "param" in value ) return [name, route.parameters[value.param]];

            if ( isRecord(value) && "query" in value ) return [name, route.query[value.query]];

            if ( isRecord(value) && "signal" in value ) return [name, route.signals?.[value.signal]];

            return [name, value];

        }),
    );

}

export async function portValue (
    port: CompiledPort | undefined,
    route: Route,
    source: PortSource,
    signal?: AbortSignal,
): Promise<unknown> {

    return (await portAnswer(port, route, source, signal)).value;

}

export async function portAnswer (
    port: CompiledPort | undefined,
    route: Route,
    source: PortSource,
    signal?: AbortSignal,
): Promise<PortAnswer> {

    if ( !port || port.kind === "write" ) return { value: undefined };

    if ( port.kind === "data" ) return { value: port.value };

    if ( port.kind === "site" ) return { value: await source.site(port.path) };

    return source.read(port.feature, port.operation, fillInput(port.input, route), port.many, signal);

}

export function rows ( value: unknown ): Rows {

    return Array.isArray(value) ? value.filter(isRecord) : [];

}

export function row ( value: unknown ): Record<string, unknown> | undefined {

    if ( Array.isArray(value) ) return value.find(isRecord);

    return isRecord(value) ? value : undefined;

}

export function field ( record: Record<string, unknown> | undefined, path: string ): string | undefined {

    const value = record ? pathGet(record, path) : undefined;

    return typeof value === "string" || typeof value === "number" || typeof value === "boolean"
        ? String(value)
        : undefined;

}
