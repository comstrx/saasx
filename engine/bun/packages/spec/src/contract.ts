import { apiInputShape, apiShape, contractShape, overridesShape, resourceShapes } from "engine/api";
import { mapValues } from "engine/base";
import { isOrigin } from "engine/net";
import { isTimeZone } from "engine/translate";
import { currency, fluent, text, word, z } from "engine/validate";

export type Shape = z.ZodType;
export type Shapes = Record<string, Shape>;

export const siteUrl = text.refine(
    isOrigin,
    "Expected an HTTP(S) origin without credentials, path, query or fragment.",
);
export const prefixShape = z.string().regex(/^(?:[a-zA-Z0-9_.-]+(?:\/[a-zA-Z0-9_.-]+)*)?$/);
export const connectionShape = apiInputShape.shape.connections.valueType;
export const realtimeShape = z.strictObject({
    url: z.string().regex(/^wss?:\/\/[^\s/?#]+$/),
    key: z.string().min(1).max(200),
    protocol: z.enum(["pusher"]).default("pusher"),
});
export const colorShape = z.string().regex(/^#[a-fA-F0-9]{6}(?:[a-fA-F0-9]{2})?$/);
export const paletteShape = z.record(word, colorShape);
export const themeChoice = z.enum(["light", "dark", "system"]);
export const motionShape = z.enum(["system", "full", "reduced"]);
export const stepShape = z.union([
    z.literal(0),
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(6),
    z.literal(8),
    z.literal(12),
]);
export const themeShape = z.strictObject({ colors: z.strictObject({ light: paletteShape, dark: paletteShape }) });
export const themeInputShape = z
    .strictObject({
        colors: z.strictObject({ light: paletteShape.optional(), dark: paletteShape.optional() }).optional(),
    })
    .default({});
export const contractOverrides = { request: overridesShape.shape.request, response: overridesShape.shape.response };

export function brandImage ( root: string, formats: readonly string[] ): z.ZodString {

    return z.string().regex(new RegExp(`^${root}/[a-zA-Z0-9/_-]+\\.(?:${formats.join("|")})$`));

}
export function fontFaceShape ( formats: readonly string[], weight: RegExp ) {

    const file = z.string().regex(new RegExp(`^[a-zA-Z0-9_-]+\\.(?:${formats.join("|")})$`));

    return z.strictObject({ file, weight: z.string().regex(weight) });

}
export function fontsShape<L extends z.ZodEnum> ( locale: L, face: ReturnType<typeof fontFaceShape> ) {

    return z.partialRecord(locale, z.array(face).min(1).max(10));

}
export function contentShape ( image: z.ZodString ) {

    return resourceShapes.content.extend({
        url: siteUrl.nullable().default(null),
        logo: image.nullable().default(null),
        logo_dark: image.nullable().default(null),
        icon: image.nullable().default(null),
    });

}
export function choice<T extends Shape> ( value: T ) {

    return z.strictObject({ default: value, enabled: z.array(value).min(1) });

}
export function baseSettings<L extends z.ZodEnum, F extends Shape> ( locale: L, fonts: F ) {

    return {
        locale: choice(locale).extend({ timeZone: text.refine(isTimeZone, "Unknown time zone.") }),
        currency: choice(currency),
        theme: choice(themeChoice),
        motion: motionShape,
        maintenance: z.boolean(),
        maintenanceMessage: z.string(),
        fonts,
        mediaOrigins: z.array(siteUrl).max(20),
    };

}

export const backendOptionFields = {
    prefix: prefixShape.default(""),
    insecure: z.boolean().default(false),
    execution: overridesShape.shape.execution,
    encoding: overridesShape.shape.encoding,
    cache: overridesShape.shape.cache,
};

export function settingsInput<S extends z.ZodObject> ( settings: S, required: readonly string[] = [] ) {

    const shape = settings.shape as Shapes;
    const loosened = mapValues(shape, ( value, name ) => {

        if ( required.includes(name) ) return value;

        return fluent(value instanceof z.ZodObject ? fluent(value).partial() : value).optional();

    });
    const input = z.strictObject(loosened);

    return required.length ? input : input.default({});

}
export function configShapes<C extends z.ZodObject, S extends z.ZodObject, I extends Shape, B extends z.ZodObject> (
    content: C,
    settings: S,
    settingsIn: I,
    contracts: B,
) {

    const seo = (content.shape as Shapes).seo;
    const seoIn =
        seo instanceof z.ZodDefault
            ? (fluent(seo).unwrap() as z.ZodObject).partial().optional()
            : (seo ?? z.never().optional());

    return {
        configShape: z.strictObject({
            content,
            settings,
            theme: themeShape,
            api: apiShape.nullable(),
            contract: contractShape,
            realtime: realtimeShape.nullable(),
            assets: siteUrl.nullable(),
            insecure: z.boolean(),
        }),
        configInputShape: z.strictObject({
            contents: content
                .partial()
                .extend({ name: (content.shape as Shapes).name as z.ZodString, seo: seoIn as z.ZodOptional }),
            settings: settingsIn,
            themes: themeInputShape,
            contracts: contracts.nullable().default(null),
            features: overridesShape.shape.features,
        }),
    };

}
