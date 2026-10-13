import * as zm from "zod/mini";

type Any = zm.ZodMiniType;
type Shape = zm.core.$ZodShape;
type Objectish = zm.ZodMiniObject;
type Message = string | undefined;

type ShapeOf<S> = S extends zm.ZodMiniObject<infer T, zm.core.$ZodObjectConfig> ? T : Shape;
type ConfigOf<S> = S extends zm.ZodMiniObject<Shape, infer C> ? C : zm.core.$strip;

type Me<T, S extends Any> = T extends Any ? T : S;

/**
 * The chain every schema answers: the words zod's classic build speaks, each returning a new
 * `zod/mini` schema with the check applied, so the engine ships mini's size and keeps the DSL.
 * Every method speaks of `this`, so a schema held behind a type parameter keeps its own shape
 * through the chain instead of its constraint's.
 */
// biome-ignore lint/style/useConsistentTypeDefinitions: `this` is polymorphic only in an interface
export interface Chain<S extends Any> {
    optional(): Fluent<zm.ZodMiniOptional<Me<this, S>>>;
    nullable(): Fluent<zm.ZodMiniNullable<Me<this, S>>>;
    nullish(): Fluent<zm.ZodMiniOptional<zm.ZodMiniNullable<Me<this, S>>>>;
    default(value: zm.output<S>): Fluent<zm.ZodMiniDefault<Me<this, S>>>;
    min(limit: number, message?: Message): this;
    max(limit: number, message?: Message): this;
    regex(pattern: RegExp, message?: Message): this;
    int(): this;
    positive(): this;
    nonnegative(): this;
    finite(): this;
    refine(test: (value: zm.output<S>) => boolean, message?: Message): this;
    meta(data: Record<string, unknown>): this;
    or<T extends Any>(other: T): Fluent<zm.ZodMiniUnion<[Me<this, S>, T]>>;
    partial(): Fluent<
        zm.ZodMiniObject<
            { [K in keyof ShapeOf<Me<this, S>>]: zm.ZodMiniOptional<ShapeOf<Me<this, S>>[K]> },
            ConfigOf<Me<this, S>>
        >
    >;
    required(): Fluent<
        zm.ZodMiniObject<
            { [K in keyof ShapeOf<Me<this, S>>]: zm.ZodMiniNonOptional<ShapeOf<Me<this, S>>[K]> },
            ConfigOf<Me<this, S>>
        >
    >;
    extend<T extends Shape>(
        shape: T,
    ): Fluent<zm.ZodMiniObject<zm.core.util.Extend<ShapeOf<Me<this, S>>, T>, ConfigOf<Me<this, S>>>>;
    omit<M extends zm.core.util.Mask<keyof ShapeOf<Me<this, S>>>>(
        mask: M,
    ): Fluent<zm.ZodMiniObject<zm.core.util.Flatten<Omit<ShapeOf<Me<this, S>>, keyof M>>, ConfigOf<Me<this, S>>>>;
    passthrough(): Fluent<zm.ZodMiniObject<ShapeOf<Me<this, S>>, zm.core.$loose>>;
    pick<M extends zm.core.util.Mask<keyof ShapeOf<Me<this, S>>>>(
        mask: M,
    ): Fluent<
        zm.ZodMiniObject<
            zm.core.util.Flatten<Pick<ShapeOf<Me<this, S>>, Extract<keyof ShapeOf<Me<this, S>>, keyof M>>>,
            ConfigOf<Me<this, S>>
        >
    >;
    prefault(value: zm.input<S>): Fluent<zm.ZodMiniPrefault<Me<this, S>>>;
    unwrap(): Me<this, S> extends { _zod: { def: { innerType: infer I extends Any } } } ? Fluent<I> : never;
    readonly valueType: Me<this, S> extends { _zod: { def: { valueType: infer V extends Any } } } ? V : never;
}
export type Fluent<S extends Any> = S & Chain<S>;

const lengths = new Set(["string", "array"]);

function kindOf(schema: Any): string {
    return schema._zod.def.type;
}
function withCheck<S extends Any>(schema: S, check: zm.core.$ZodCheck<never>): Fluent<S> {
    return fluent(schema.check(check as never) as S);
}
const chain: { [K in keyof Chain<Any>]: (schema: Any, ...args: never[]) => unknown } = {
    optional: (schema) => fluent(zm.optional(schema)),
    nullable: (schema) => fluent(zm.nullable(schema)),
    nullish: (schema) => fluent(zm.nullish(schema)),
    default: (schema, value: unknown) => fluent(zm._default(schema, value as never)),
    min: (schema, limit: number, message?: Message) =>
        withCheck(schema, lengths.has(kindOf(schema)) ? zm.minLength(limit, message) : zm.gte(limit, message)),
    max: (schema, limit: number, message?: Message) =>
        withCheck(schema, lengths.has(kindOf(schema)) ? zm.maxLength(limit, message) : zm.lte(limit, message)),
    regex: (schema, pattern: RegExp, message?: Message) => withCheck(schema, zm.regex(pattern, message)),
    int: (schema) => withCheck(schema, zm.int()),
    positive: (schema) => withCheck(schema, zm.positive()),
    nonnegative: (schema) => withCheck(schema, zm.nonnegative()),
    finite: (schema) => fluent(schema), // zod 4 numbers are finite already
    refine: (schema, test: (value: unknown) => boolean, message?: Message) =>
        withCheck(schema, zm.refine(test, message) as zm.core.$ZodCheck<never>),
    meta: (schema, data: Record<string, unknown>) => {
        const out = fluent(schema);

        zm.globalRegistry.add(schema, data as never);
        zm.globalRegistry.add(out, data as never);

        return out;
    },
    or: (schema, other: Any) => fluent(zm.union([schema, other])),
    partial: (schema) => fluent(zm.partial(schema as Objectish)),
    required: (schema) => fluent(zm.required(schema as Objectish)),
    extend: (schema, shape: Shape) => fluent(zm.extend(schema as Objectish, shape)),
    omit: (schema, mask: Record<string, true>) => fluent(zm.omit(schema as Objectish, mask as never)),
    passthrough: (schema) => jitObject((schema as Objectish).shape, zm.unknown()),
    pick: (schema, mask: Record<string, true>) => fluent(zm.pick(schema as Objectish, mask as never)),
    prefault: (schema, value: unknown) => fluent(zm.prefault(schema, value as never)),
    unwrap: (schema) => fluent((schema._zod.def as unknown as { innerType: Any }).innerType),
    valueType: (schema) => (schema._zod.def as unknown as { valueType: Any }).valueType,
};
const properties = new Set(["valueType"]);
const marked = Symbol("fluent");
const descriptors: PropertyDescriptorMap = Object.fromEntries(
    Object.entries(chain).map(([name, method]): [string, PropertyDescriptor] => [
        name,
        properties.has(name)
            ? {
                  configurable: true,
                  get(this: Any) {
                      return method(this);
                  },
              }
            : {
                  configurable: true,
                  writable: true,
                  value(this: Any, ...args: never[]) {
                      return method(this, ...args);
                  },
              },
    ]),
);

/**
 * A `zod/mini` schema taught the classic chain: the methods are defined on the instance itself, so
 * parsing, `shape`, `def` and `instanceof` run against the real schema with nothing in between.
 */
export function fluent<S extends Any>(schema: S): Fluent<S> {
    if (!Object.hasOwn(schema, marked)) {
        Object.defineProperties(schema, descriptors);
        Object.defineProperty(schema, marked, { value: true });
    }

    return schema as Fluent<S>;
}
function wrap<A extends unknown[], S extends Any>(create: (...args: A) => S): (...args: A) => Fluent<S> {
    return (...args) => fluent(create(...args));
}

export const string = wrap(zm.string);
export const number = wrap(zm.number);
export const boolean = wrap(zm.boolean);
export const unknown = wrap(zm.unknown);
export const never = wrap(zm.never);
export const email = wrap(zm.email);
export const file = wrap(zm.file);
export function literal<const T extends zm.core.util.Literal>(value: T): Fluent<zm.ZodMiniLiteral<T>> {
    return fluent(zm.literal(value));
}
export function array<T extends Any>(item: T): Fluent<zm.ZodMiniArray<T>> {
    return fluent(zm.array(item));
}
export function record<K extends zm.core.$ZodRecordKey, V extends Any>(
    key: K,
    value: V,
): Fluent<zm.ZodMiniRecord<K, V>> {
    return fluent(zm.record(key, value));
}
export function partialRecord<K extends zm.core.$ZodRecordKey, V extends Any>(
    key: K,
    value: V,
): Fluent<ReturnType<typeof zm.partialRecord<K, V>>> {
    return fluent(zm.partialRecord(key, value));
}
export function union<const T extends readonly Any[]>(options: T): Fluent<zm.ZodMiniUnion<T>> {
    return fluent(zm.union(options));
}
export function lazy<T extends Any>(getter: () => T): Fluent<zm.ZodMiniLazy<T>> {
    return fluent(zm.lazy(getter));
}
/**
 * Mini's object class over zod's JIT object parser, the one the classic build runs: same traits, so
 * `instanceof ZodMiniObject` and every mini object helper hold, at the classic build's parse speed.
 */
const miniType: zm.core.$constructor<zm.ZodMiniType> = zm.ZodMiniType;
// biome-ignore lint/security/noSecrets: a zod trait name, so `instanceof ZodMiniObject` holds
const JitObject: zm.core.$constructor<zm.ZodMiniObject> = zm.core.$constructor("ZodMiniObject", (inst, def) => {
    zm.core.$ZodObjectJIT.init(inst, def);
    miniType.init(inst, def);
    zm.core.util.installLazyProp(inst, "shape", (self: zm.ZodMiniObject) => self._zod.def.shape, false);
});

function jitObject<T extends Shape, C extends zm.core.$ZodObjectConfig>(
    shape: T,
    catchall?: Any,
): Fluent<zm.ZodMiniObject<T, C>> {
    return fluent(
        new JitObject({ type: "object", shape, ...(catchall ? { catchall } : {}) }) as zm.ZodMiniObject<T, C>,
    );
}
export function object<T extends Shape>(shape: T): Fluent<zm.ZodMiniObject<T, zm.core.$strip>> {
    return jitObject(shape);
}
export function strictObject<T extends Shape>(shape: T): Fluent<zm.ZodMiniObject<T, zm.core.$strict>> {
    return jitObject(shape, zm.never());
}
export function looseObject<T extends Shape>(shape: T): Fluent<zm.ZodMiniObject<T, zm.core.$loose>> {
    return jitObject(shape, zm.unknown());
}
export function custom<T>(test?: (value: unknown) => unknown): Fluent<zm.ZodMiniCustom<T, T>> {
    return fluent(zm.custom<T>(test));
}
export function enumOf<const T extends readonly string[]>(
    values: T,
): Fluent<zm.ZodMiniEnum<zm.core.util.ToEnum<T[number]>>> {
    return fluent(zm.enum(values as unknown as [string, ...string[]]) as never);
}
export { enumOf as enum };
export function nullOf(): Fluent<zm.ZodMiniNull> {
    return fluent(zm.null());
}
export { nullOf as null };
export const coerce = {
    number: wrap(zm.coerce.number),
    string: wrap(zm.coerce.string),
    boolean: wrap(zm.coerce.boolean),
};
export const iso = { date: wrap(zm.iso.date), datetime: wrap(zm.iso.datetime) };
export const globalRegistry = zm.globalRegistry;
export { core } from "zod/mini";
export const ZodObject = zm.ZodMiniObject;
export const ZodDefault = zm.ZodMiniDefault;
export const safeParse = zm.safeParse;
export const parse = zm.parse;

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
