import { mapValues } from "engine/base";
import type * as zm from "zod/mini";
import {
    array as zodArray,
    boolean as zodBoolean,
    coerce as zodCoerce,
    config as zodConfig,
    custom as zodCustom,
    _default as zodDefault,
    email as zodEmail,
    enum as zodEnum,
    extend as zodExtend,
    file as zodFile,
    globalRegistry as zodGlobalRegistry,
    gte as zodGte,
    int as zodInt,
    iso as zodIso,
    lazy as zodLazy,
    literal as zodLiteral,
    lte as zodLte,
    maxLength as zodMaxLength,
    minLength as zodMinLength,
    never as zodNever,
    nonnegative as zodNonnegative,
    null as zodNull,
    nullable as zodNullable,
    nullish as zodNullish,
    number as zodNumber,
    omit as zodOmit,
    optional as zodOptional,
    parse as zodParse,
    partial as zodPartial,
    partialRecord as zodPartialRecord,
    pick as zodPick,
    positive as zodPositive,
    prefault as zodPrefault,
    record as zodRecord,
    refine as zodRefine,
    regex as zodRegex,
    required as zodRequired,
    safeParse as zodSafeParse,
    string as zodString,
    union as zodUnion,
    unknown as zodUnknown,
    ZodMiniDefault as zodZodMiniDefault,
    ZodMiniObject as zodZodMiniObject,
    ZodMiniType as zodZodMiniType,
} from "zod/mini";
import * as core from "zod/v4/core";

const mini = {
    ZodMiniDefault: zodZodMiniDefault,
    ZodMiniObject: zodZodMiniObject,
    ZodMiniType: zodZodMiniType,
    _default: zodDefault,
    array: zodArray,
    boolean: zodBoolean,
    coerce: zodCoerce,
    custom: zodCustom,
    email: zodEmail,
    enum: zodEnum,
    extend: zodExtend,
    file: zodFile,
    globalRegistry: zodGlobalRegistry,
    gte: zodGte,
    int: zodInt,
    iso: zodIso,
    lazy: zodLazy,
    literal: zodLiteral,
    lte: zodLte,
    maxLength: zodMaxLength,
    minLength: zodMinLength,
    never: zodNever,
    nonnegative: zodNonnegative,
    null: zodNull,
    nullable: zodNullable,
    nullish: zodNullish,
    number: zodNumber,
    omit: zodOmit,
    optional: zodOptional,
    parse: zodParse,
    partial: zodPartial,
    partialRecord: zodPartialRecord,
    pick: zodPick,
    positive: zodPositive,
    prefault: zodPrefault,
    record: zodRecord,
    refine: zodRefine,
    regex: zodRegex,
    required: zodRequired,
    safeParse: zodSafeParse,
    string: zodString,
    union: zodUnion,
    unknown: zodUnknown,
};

type Any = zm.ZodMiniType;
type Shape = zm.core.$ZodShape;
type Objectish = zm.ZodMiniObject;
type Message = string | undefined;

type ShapeOf<S> = S extends zm.ZodMiniObject<infer T, zm.core.$ZodObjectConfig> ? T : Shape;
type ConfigOf<S> = S extends zm.ZodMiniObject<Shape, infer C> ? C : zm.core.$strip;

type Me<T, S extends Any> = T extends Any ? T : S;

export interface Chain<S extends Any> {
    optional (): Fluent<zm.ZodMiniOptional<Me<this, S>>>;
    nullable (): Fluent<zm.ZodMiniNullable<Me<this, S>>>;
    nullish (): Fluent<zm.ZodMiniOptional<zm.ZodMiniNullable<Me<this, S>>>>;
    default ( value: zm.output<S> ): Fluent<zm.ZodMiniDefault<Me<this, S>>>;
    min ( limit: number, message?: Message ): this;
    max ( limit: number, message?: Message ): this;
    regex ( pattern: RegExp, message?: Message ): this;
    int (): this;
    positive (): this;
    nonnegative (): this;
    finite (): this;
    refine ( test: ( value: zm.output<S> ) => boolean, message?: Message ): this;
    meta ( data: Record<string, unknown> ): this;
    or<T extends Any> ( other: T ): Fluent<zm.ZodMiniUnion<[Me<this, S>, T]>>;
    partial (): Fluent<
        zm.ZodMiniObject<
            { [K in keyof ShapeOf<Me<this, S>>]: zm.ZodMiniOptional<ShapeOf<Me<this, S>>[K]> },
            ConfigOf<Me<this, S>>
        >
    >;
    required (): Fluent<
        zm.ZodMiniObject<
            { [K in keyof ShapeOf<Me<this, S>>]: zm.ZodMiniNonOptional<ShapeOf<Me<this, S>>[K]> },
            ConfigOf<Me<this, S>>
        >
    >;
    extend<T extends Shape> (
        shape: T,
    ): Fluent<zm.ZodMiniObject<zm.core.util.Extend<ShapeOf<Me<this, S>>, T>, ConfigOf<Me<this, S>>>>;
    omit<M extends zm.core.util.Mask<keyof ShapeOf<Me<this, S>>>> (
        mask: M,
    ): Fluent<zm.ZodMiniObject<zm.core.util.Flatten<Omit<ShapeOf<Me<this, S>>, keyof M>>, ConfigOf<Me<this, S>>>>;
    passthrough (): Fluent<zm.ZodMiniObject<ShapeOf<Me<this, S>>, zm.core.$loose>>;
    pick<M extends zm.core.util.Mask<keyof ShapeOf<Me<this, S>>>> (
        mask: M,
    ): Fluent<
        zm.ZodMiniObject<
            zm.core.util.Flatten<Pick<ShapeOf<Me<this, S>>, Extract<keyof ShapeOf<Me<this, S>>, keyof M>>>,
            ConfigOf<Me<this, S>>
        >
    >;
    prefault ( value: zm.input<S> ): Fluent<zm.ZodMiniPrefault<Me<this, S>>>;
    unwrap (): Me<this, S> extends { _zod: { def: { innerType: infer I extends Any } } } ? Fluent<I> : never;
    readonly valueType: Me<this, S> extends { _zod: { def: { valueType: infer V extends Any } } } ? V : never;
}
export type Fluent<S extends Any> = S & Chain<S>;

const lengths = new Set(["string", "array"]);

function kindOf ( schema: Any ): string {

    return schema._zod.def.type;

}
function withCheck<S extends Any> ( schema: S, check: zm.core.$ZodCheck<never> ): Fluent<S> {

    return fluent(schema.check(check as never) as S);

}
const chain: { [K in keyof Chain<Any>]: ( schema: Any, ...args: never[] ) => unknown } = {
    optional: ( schema ) => fluent(mini.optional(schema)),
    nullable: ( schema ) => fluent(mini.nullable(schema)),
    nullish: ( schema ) => fluent(mini.nullish(schema)),
    default: ( schema, value: unknown ) => fluent(mini._default(schema, value as never)),
    min: ( schema, limit: number, message?: Message ) =>
        withCheck(schema, lengths.has(kindOf(schema)) ? mini.minLength(limit, message) : mini.gte(limit, message)),
    max: ( schema, limit: number, message?: Message ) =>
        withCheck(schema, lengths.has(kindOf(schema)) ? mini.maxLength(limit, message) : mini.lte(limit, message)),
    regex: ( schema, pattern: RegExp, message?: Message ) => withCheck(schema, mini.regex(pattern, message)),
    int: ( schema ) => withCheck(schema, mini.int()),
    positive: ( schema ) => withCheck(schema, mini.positive()),
    nonnegative: ( schema ) => withCheck(schema, mini.nonnegative()),
    finite: ( schema ) => fluent(schema),
    refine: ( schema, test: ( value: unknown ) => boolean, message?: Message ) =>
        withCheck(schema, mini.refine(test, message) as zm.core.$ZodCheck<never>),
    meta: ( schema, data: Record<string, unknown> ) => {

        const out = fluent(schema);

        mini.globalRegistry.add(schema, data as never);
        mini.globalRegistry.add(out, data as never);

        return out;

    },
    or: ( schema, other: Any ) => fluent(mini.union([schema, other])),
    partial: ( schema ) => fluent(mini.partial(schema as Objectish)),
    required: ( schema ) => fluent(mini.required(schema as Objectish)),
    extend: ( schema, shape: Shape ) => fluent(mini.extend(schema as Objectish, shape)),
    omit: ( schema, mask: Record<string, true> ) => fluent(mini.omit(schema as Objectish, mask as never)),
    passthrough: ( schema ) => jitObject((schema as Objectish).shape, mini.unknown()),
    pick: ( schema, mask: Record<string, true> ) => fluent(mini.pick(schema as Objectish, mask as never)),
    prefault: ( schema, value: unknown ) => fluent(mini.prefault(schema, value as never)),
    unwrap: ( schema ) => fluent((schema._zod.def as unknown as { innerType: Any }).innerType),
    valueType: ( schema ) => (schema._zod.def as unknown as { valueType: Any }).valueType,
};
const properties = new Set(["valueType"]);
const marked = Symbol("fluent");
const descriptors: PropertyDescriptorMap = mapValues(chain, ( method, name ): PropertyDescriptor => {

    if ( properties.has(name) ) {

        return {
            configurable: true,
            get ( this: Any ) {

                return method(this);

            },
        };

    }

    return {
        configurable: true,
        writable: true,
        value ( this: Any, ...args: never[] ) {

            return method(this, ...args);

        },
    };

});

export function fluent<S extends Any> ( schema: S ): Fluent<S> {

    if ( !Object.hasOwn(schema, marked) ) {

        Object.defineProperties(schema, descriptors);
        Object.defineProperty(schema, marked, { value: true });

    }

    return schema as Fluent<S>;

}
function wrap<A extends unknown[], S extends Any> ( create: ( ...args: A ) => S ): ( ...args: A ) => Fluent<S> {

    return ( ...args ) => fluent(create(...args));

}

export const string = wrap(mini.string);
export const number = wrap(mini.number);
export const boolean = wrap(mini.boolean);
export const unknown = wrap(mini.unknown);
export const never = wrap(mini.never);
export const email = wrap(mini.email);
export const file = wrap(mini.file);
export function literal<const T extends zm.core.util.Literal> ( value: T ): Fluent<zm.ZodMiniLiteral<T>> {

    return fluent(mini.literal(value));

}
export function array<T extends Any> ( item: T ): Fluent<zm.ZodMiniArray<T>> {

    return fluent(mini.array(item));

}
export function record<K extends zm.core.$ZodRecordKey, V extends Any> (
    key: K,
    value: V,
): Fluent<zm.ZodMiniRecord<K, V>> {

    return fluent(mini.record(key, value));

}
export function partialRecord<K extends zm.core.$ZodRecordKey, V extends Any> (
    key: K,
    value: V,
): Fluent<ReturnType<typeof zm.partialRecord<K, V>>> {

    return fluent(mini.partialRecord(key, value));

}
export function union<const T extends readonly Any[]> ( options: T ): Fluent<zm.ZodMiniUnion<T>> {

    return fluent(mini.union(options));

}
export function lazy<T extends Any> ( getter: () => T ): Fluent<zm.ZodMiniLazy<T>> {

    return fluent(mini.lazy(getter));

}

const miniType: zm.core.$constructor<zm.ZodMiniType> = mini.ZodMiniType;
const objectJit: zm.core.$constructor<zm.core.$ZodObject> = core.$ZodObjectJIT;

const JitObject: zm.core.$constructor<zm.ZodMiniObject> = core.$constructor("ZodMiniObject", ( inst, def ) => {

    objectJit.init(inst, def);
    miniType.init(inst, def);
    core.util.installLazyProp(inst, "shape", ( self: zm.ZodMiniObject ) => self._zod.def.shape, false);

});

function jitObject<T extends Shape, C extends zm.core.$ZodObjectConfig> (
    shape: T,
    catchall?: Any,
): Fluent<zm.ZodMiniObject<T, C>> {

    return fluent(
        new JitObject({ type: "object", shape, ...(catchall ? { catchall } : {}) }) as zm.ZodMiniObject<T, C>,
    );

}
export function object<T extends Shape> ( shape: T ): Fluent<zm.ZodMiniObject<T, zm.core.$strip>> {

    return jitObject(shape);

}
export function strictObject<T extends Shape> ( shape: T ): Fluent<zm.ZodMiniObject<T, zm.core.$strict>> {

    return jitObject(shape, mini.never());

}
export function looseObject<T extends Shape> ( shape: T ): Fluent<zm.ZodMiniObject<T, zm.core.$loose>> {

    return jitObject(shape, mini.unknown());

}
export function custom<T> ( test?: ( value: unknown ) => unknown ): Fluent<zm.ZodMiniCustom<T, T>> {

    return fluent(mini.custom<T>(test));

}
export function enumOf<const T extends readonly string[]> (
    values: T,
): Fluent<zm.ZodMiniEnum<zm.core.util.ToEnum<T[number]>>> {

    return fluent(mini.enum(values as unknown as [string, ...string[]]) as never);

}
export { enumOf as enum };
export function nullOf (): Fluent<zm.ZodMiniNull> {

    return fluent(mini.null());

}
export { nullOf as null };
export const coerce = {
    number: wrap(mini.coerce.number),
    string: wrap(mini.coerce.string),
    boolean: wrap(mini.coerce.boolean),
};
export const iso = { date: wrap(mini.iso.date), datetime: wrap(mini.iso.datetime) };
export const globalRegistry = mini.globalRegistry;
export type { core } from "zod/mini";
export const ZodObject = mini.ZodMiniObject;
export const ZodDefault = mini.ZodMiniDefault;
export const safeParse = mini.safeParse;
export const parse = mini.parse;

export type ZodType<O = unknown, I = unknown> = zm.ZodMiniType<O, I>;
export type ZodObject<
    S extends Shape = zm.core.$ZodLooseShape,
    C extends zm.core.$ZodObjectConfig = zm.core.$ZodObjectConfig,
> = Fluent<zm.ZodMiniObject<S, C>>;
export type ZodString = Fluent<zm.ZodMiniString>;
export type ZodNumber = Fluent<zm.ZodMiniNumber>;
export type ZodBoolean = Fluent<zm.ZodMiniBoolean>;
export type ZodEnum<T extends zm.core.util.EnumLike = zm.core.util.EnumLike> = zm.ZodMiniEnum<T>;
export type ZodOptional<S extends Any = Any> = Fluent<zm.ZodMiniOptional<S>>;
export type ZodNullable<S extends Any = Any> = Fluent<zm.ZodMiniNullable<S>>;
export type ZodDefault<S extends Any = Any> = Fluent<zm.ZodMiniDefault<S>>;
export type ZodRecord<K extends zm.core.$ZodRecordKey = zm.core.$ZodRecordKey, V extends Any = Any> = Fluent<
    zm.ZodMiniRecord<K, V>
>;
export type ZodUnion<T extends readonly Any[] = readonly Any[]> = Fluent<zm.ZodMiniUnion<T>>;
export type ZodEmail = Fluent<zm.ZodMiniEmail>;
export type ZodISODateTime = Fluent<zm.ZodMiniISODateTime>;
export type ZodRawShape = Shape;
export type ZodError = zm.core.$ZodError;
export type output<T> = zm.output<T>;
export type input<T> = zm.input<T>;
export type infer<T> = zm.output<T>;
if ( typeof (globalThis as { document?: unknown }).document !== "undefined" ) zodConfig({ jitless: true });

export function jitless ( on = true ): boolean {

    return zodConfig({ jitless: on }).jitless === true;

}
