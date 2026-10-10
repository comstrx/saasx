import { z } from "../../lib/providers/schema.ts";
import { mapValues } from "../../lib/std/object.ts";
import { templateKeys } from "../../lib/std/route.ts";
import { ack, bulk, id, list, suggest, text } from "./fields.ts";
import { type Resource, resourceShapes } from "./resource.ts";
import { type Layer, type Method, merge } from "./wire.ts";

export type Endpoint<I extends z.ZodObject = z.ZodObject, O extends z.ZodType = z.ZodType, M extends boolean = boolean> = {
    method: Method;
    path: string;
    input: I;
    output: O;
    many: M;
    local?: Resource;
    wire: Layer;
};

type Shape = z.ZodObject | z.ZodRawShape;
type Many<T extends z.ZodType = z.ZodType> = { many: T };
type Strict<S extends Shape> = S extends z.ZodObject ? S : S extends z.ZodRawShape ? z.ZodObject<S, z.core.$strict> : never;
type Item<O> = O extends Many<infer T> ? T : O extends z.ZodType ? O : never;
type Route<S extends Shape, O> = Endpoint<Strict<S>, Item<O>, O extends Many ? true : false>;
type Key = z.ZodRawShape;

export type Verb = keyof ReturnType<typeof engagements>;
type Facts = { permissions: readonly string[]; touches: readonly string[] };

export const get = route("GET");
export const post = route("POST");
export const put = route("PUT");
export const del = route("DELETE");

const reaction = z.object({ reaction: z.enum(["like", "dislike"]).nullish() });
export const suggestion = z.object({ id: z.number(), type: text, label: text });
const report = z.object({ id: z.number(), reason: text, title: text, content: text, status: text, created_at: text });

const ids = { ids: z.array(id).min(1).max(100) };
const complaint = { reason: z.string().max(200).optional(), title: z.string().max(200).optional(), content: z.string().min(1).max(5000) };
const facts = new WeakMap<object, Facts>();

function route ( method: Method ) {

    return <const S extends Shape, const O extends z.ZodType | Many> (
        path: string,
        input: S,
        output: O,
        wire: Layer = {},
    ): Route<S, O> => {

        const schema = (input instanceof z.ZodObject ? input : z.strictObject(input)) as Strict<S>;
        const missing = templateKeys(path).filter(( key ) => !Object.hasOwn(schema.shape, key));

        if ( missing.length ) throw new Error(`${method} ${path}: path parameters need inputs: ${missing.join(", ")}`);

        return {
            method,
            path,
            wire,
            input: schema,
            output: ("many" in output ? output.many : output) as Item<O>,
            many: ("many" in output) as O extends Many ? true : false,
        };

    };

}
export function many<T extends z.ZodType> ( item: T ): Many<T> {

    return { many: item };

}
export function feature<const T extends Record<string, Endpoint>> ( defaults: Layer & Partial<Facts>, endpoints: T ): T {

    const { permissions = [], touches = [], ...layer } = defaults;
    const declared = mapValues(endpoints, ( endpoint ) => ({ ...endpoint, wire: merge(layer, endpoint.wire) })) as T;

    facts.set(declared, { permissions, touches });

    return declared;

}
export function factsOf ( endpoints: object ): Facts {

    return facts.get(endpoints) ?? { permissions: [], touches: [] };

}
function engagements<const K extends Key> ( base: string, key: K, wire: Layer ) {

    return {
        like: post(`${base}/like`, key, ack, wire),
        dislike: post(`${base}/dislike`, key, ack, wire),
        unreact: post(`${base}/unreact`, key, ack, wire),
        reaction: get(`${base}/reaction`, key, reaction, wire),
        visit: post(`${base}/view`, key, ack, wire),
        unvisit: post(`${base}/unview`, key, ack, wire),
        favorite: post(`${base}/favorite`, key, ack, wire),
        unfavorite: post(`${base}/unfavorite`, key, ack, wire),
        report: post(`${base}/report`, { ...key, ...complaint }, report, wire),
    };

}
export function engage<const K extends Key, const V extends Verb> ( base: string, key: K, verbs: readonly V[], wire: Layer = {} ) {

    const all = engagements(base, key, { execution: "client", ...wire });

    return Object.fromEntries(verbs.map(( verb ) => [verb, all[verb]])) as Pick<ReturnType<typeof engagements<K>>, V>;

}
export function browse<const K extends Key, const T extends z.ZodType> ( base: string, key: K, item: T, filters: Layer = {} ) {

    const [name] = Object.keys(key);

    return {
        list: get(base, list, many(item), { cache: 60, ...filters }),
        suggest: get(`${base}/suggest`, suggest, many(suggestion)),
        view: get(`${base}/{${name}}`, key, item, { cache: 30 }),
    };

}
export function trash<const K extends Key> ( base: string, key: K, wire: Layer = {} ) {

    const [name] = Object.keys(key);
    const scope = { execution: "client", ...wire } as const;

    return {
        remove: del(`${base}/{${name}}`, key, ack, scope),
        restore: post(`${base}/{${name}}/restore`, key, ack, scope),
        removeMany: del(base, ids, bulk, scope),
        restoreMany: post(`${base}/restore`, ids, bulk, scope),
    };

}
export function document<R extends Resource> ( resource: R, path?: string, wire: Layer = {} ) {

    return {
        read: {
            ...get(path ?? "/", { path: z.string().min(1).max(200).optional() }, resourceShapes[resource], {
                execution: "server", enabled: path !== undefined, cache: 60, request: { fields: { path: null } }, ...wire, response: { empty: true, ...wire.response },
            }),
            local: resource,
        },
    };

}
