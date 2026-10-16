import type { ApiSurface, Pagination } from "engine/api";
import { isRecord, isScalar, mapValues, pathGet } from "engine/base";
import type { Route } from "engine/screen";
import type { CompiledPort, Input } from "engine/spec";
import { formatMoney } from "engine/translate";

export type PortAnswer = { value: unknown; pagination?: Pagination | undefined };
export type Reader = (
    feature: string,
    operation: string,
    input: Record<string, unknown>,
    many: boolean,
    signal?: AbortSignal | undefined,
) => Promise<PortAnswer> | PortAnswer;
export type PortSource = { read: Reader; site: ( path: string ) => Promise<unknown> | unknown };
export type Local = { local: true; value: unknown } | { local: false };
export type Rows = Record<string, unknown>[];

export function fillInput ( input: Input, route: Route ): Record<string, unknown> {

    return mapValues(input, ( value ) => {

        if ( isRecord(value) && "param" in value ) return route.parameters[value.param];
        if ( isRecord(value) && "query" in value ) return route.query[value.query];
        if ( isRecord(value) && "signal" in value ) return route.signals?.[value.signal];

        return value;

    });

}
export function localPort ( port: CompiledPort | undefined, site: unknown ): Local {

    if ( !port || port.kind === "write" ) return { local: true, value: undefined };
    if ( port.kind === "data" ) return { local: true, value: port.value };
    if ( port.kind === "site" ) return { local: true, value: port.path === "$" ? site : pathGet(site, port.path) };

    return { local: false };

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
export async function portValue (
    port: CompiledPort | undefined,
    route: Route,
    source: PortSource,
    signal?: AbortSignal,
): Promise<unknown> {

    return (await portAnswer(port, route, source, signal)).value;

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

    return isScalar(value) ? String(value) : undefined;

}
export function moneyText ( locale: string, record: Record<string, unknown> | null | undefined, ...paths: string[] ): string | undefined {

    for ( const path of paths ) {

        const amount = Number(field(record ?? undefined, `${path}.amount`));
        const currency = field(record ?? undefined, `${path}.currency`);

        if ( amount > 0 && currency ) return formatMoney(locale, amount, currency).text;

    }

    return undefined;

}
