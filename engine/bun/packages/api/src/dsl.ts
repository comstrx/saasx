import { unique } from "engine/array";
import { mapValues } from "engine/base";
import { templateKeys } from "engine/parse";
import { z } from "engine/validate";
import { type Resource, resourceShapes } from "./resource.ts";
import { type Layer, type Method, merge } from "./wire.ts";

export type Endpoint<
    I extends z.ZodObject = z.ZodObject,
    O extends z.ZodType = z.ZodType,
    M extends boolean = boolean,
> = {
    method: Method;
    path: string;
    input: I;
    output: O;
    many: M;
    local?: Resource;
    wire: Layer;
    permissions: readonly string[];
};
export type Facts = { permissions: readonly string[]; touches: readonly string[] };
export type Catalogue = Readonly<Record<string, Readonly<Record<string, Endpoint>>>>;

type Shape = z.ZodObject | z.ZodRawShape;
type Many<T extends z.ZodType = z.ZodType> = { many: T };
type Strict<S extends Shape> = S extends z.ZodObject
    ? S
    : S extends z.ZodRawShape
      ? z.ZodObject<S, z.core.$strict>
      : never;
type Item<O> = O extends Many<infer T> ? T : O extends z.ZodType ? O : never;
type Route<S extends Shape, O> = Endpoint<Strict<S>, Item<O>, O extends Many ? true : false>;
type Define = <const S extends Shape, const O extends z.ZodType | Many>(
    path: string,
    input: S,
    output: O,
    wire?: Layer,
) => Route<S, O>;

const facts = new WeakMap<object, Facts>();

function route ( method: Method ): Define {

    return ( path, input, output, wire = {} ) => {

        const schema = (input instanceof z.ZodObject ? input : z.strictObject(input)) as Strict<typeof input>;
        const missing = templateKeys(path).filter(( key ) => !Object.hasOwn(schema.shape, key));

        if ( missing.length ) throw new Error(`${method} ${path}: path parameters need inputs: ${missing.join(", ")}`);

        return {
            method,
            path,
            wire,
            permissions: [],
            input: schema,
            output: ("many" in output ? output.many : output) as Item<typeof output>,
            many: ("many" in output) as typeof output extends Many ? true : false,
        };

    };

}
export const get: Define = route("GET");
export const post: Define = route("POST");
export const put: Define = route("PUT");
export const patch: Define = route("PATCH");
export const del: Define = route("DELETE");

export function many<T extends z.ZodType> ( item: T ): Many<T> {

    return { many: item };

}
export function feature<const T extends Record<string, Endpoint>> ( defaults: Layer & Partial<Facts>, endpoints: T ): T {

    const { permissions = [], touches = [], ...layer } = defaults;
    const declared = mapValues(endpoints, ( endpoint ) => ({
        ...endpoint,
        wire: merge(layer, endpoint.wire),
        permissions: unique([...permissions, ...endpoint.permissions]),
    })) as unknown as T;

    facts.set(declared, { permissions, touches });

    return declared;

}
export function factsOf ( endpoints: object ): Facts {

    return facts.get(endpoints) ?? { permissions: [], touches: [] };

}
export function document<R extends Resource> ( resource: R, path?: string, wire: Layer = {} ) {

    return {
        read: {
            ...get(path ?? "/", {}, resourceShapes[resource], {
                execution: "server",
                enabled: path !== undefined,
                cache: 60,
                ...wire,
            }),
            local: resource,
        },
    };

}
export function need<E extends Endpoint> ( permissions: readonly string[], endpoint: E ): E {

    return { ...endpoint, permissions: unique([...endpoint.permissions, ...permissions]) };

}
