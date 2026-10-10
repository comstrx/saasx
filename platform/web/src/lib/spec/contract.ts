import { apiInputShape, apiShape } from "../../api/core/config.ts";
import { currency } from "../../api/core/fields.ts";
import { type ContractOverrides, overridesShape } from "../../api/core/resolve.ts";
import { resourceShapes } from "../../api/core/resource.ts";
import { contractShape } from "../../api/core/wire.ts";
import { z } from "../providers/schema.ts";
import { isTimeZone } from "../std/locale.ts";
import { isOrigin } from "../std/url.ts";
import { text } from "./fields.ts";
import { supportedLocales } from "./languages.ts";
import { blockOptions, screenOptions, shellShape } from "./screens.ts";

const siteUrl = text.refine(isOrigin, "Expected an HTTP(S) origin without credentials, path, query or fragment.");
const prefix = z.string().regex(/^(?:[a-zA-Z0-9_.-]+(?:\/[a-zA-Z0-9_.-]+)*)?$/);
const connection = apiInputShape.shape.connections.valueType;
const brandImage = z.string().regex(/^\/assets\/images\/brand\/[a-zA-Z0-9/_-]+\.(?:png|webp|jpg|jpeg|svg|avif)$/);
const color = z.string().regex(/^(?:#[a-fA-F0-9]{6}(?:[a-fA-F0-9]{2})?|var\(--palette-[a-z-]+\))$/);
const fontFile = z.string().regex(/^[a-zA-Z0-9_-]+\.(?:woff2|woff|ttf|otf)$/);
const fontFace = z.strictObject({ file: fontFile, weight: z.string().regex(/^[1-9]00(?: [1-9]00)?$/) });
const locale = z.enum(supportedLocales);
const preferences = resourceShapes.settings.shape;
const theme = preferences.theme.unwrap();
const palette = z.strictObject({
    body: color,
    panel: color,
    popup: color,
    control: color,
    menu: color,
    track: color,
    ink: color,
    muted: color,
    placeholder: color,
    disabled: color,
    edge: color,
    float: color,
    line: color,
    strong: color,
    field: color,
    focus: color,
    primary: color,
    accent: color,
    action: color,
    ember: color,
    offer: color,
    success: color,
    warning: color,
    danger: color,
    info: color,
});

export const fontsShape = z.partialRecord(locale, z.union([fontFile, z.array(fontFace).min(1).max(10)]));

export const contentShape = resourceShapes.content.extend({
    url: siteUrl.nullable().default(null),
    logo: brandImage.nullable().default(null),
    logo_dark: brandImage.nullable().default(null),
    icon: brandImage.nullable().default(null),
    apple_icon: brandImage.nullable().default(null),
    seo: resourceShapes.seo.extend({ indexable: z.boolean().default(false) }).prefault({}),
});
export const contentBlocks = {
    infos: { name: true, tagline: true, description: true, copyright: true, header_notice: true, page_title: true, page_description: true, page_body: true },
    urls: { url: true, map_url: true },
    logos: { logo: true, logo_dark: true, logo_alt: true, logo_width: true, logo_height: true, icon: true, apple_icon: true },
    address: { address_line1: true, address_line2: true, city: true, region: true, country: true, country_code: true, postal_code: true },
    contacts: { email: true, phone: true, whatsapp: true, hours: true, contacts: true, socials: true },
    links: { header_links: true, links: true, link_groups: true, social_links: true },
} as const;

const contentsShape = z.strictObject({
    infos: contentShape.pick(contentBlocks.infos).partial().optional(),
    urls: contentShape.pick(contentBlocks.urls).partial().optional(),
    logos: contentShape.pick(contentBlocks.logos).partial().optional(),
    address: contentShape.pick(contentBlocks.address).partial().optional(),
    contacts: contentShape.pick(contentBlocks.contacts).partial().optional(),
    links: contentShape.pick(contentBlocks.links).partial().optional(),
    seo: contentShape.shape.seo.unwrap().partial().optional(),
});
export const settingsShape = z.strictObject({
    locale: z.strictObject({
        default: locale,
        enabled: z.array(locale).min(1),
        timeZone: text.refine(isTimeZone, "Unknown time zone."),
    }),
    currency: z.strictObject({ default: currency, enabled: z.array(currency).min(1) }),
    theme: z.strictObject({ default: theme, enabled: z.array(theme).min(1) }),
    motion: preferences.motion.unwrap(),
    density: preferences.density.unwrap(),
    maintenance: preferences.maintenance.unwrap(),
    maintenanceMessage: preferences.maintenance_message.unwrap(),
    fonts: fontsShape,
    mediaOrigins: z.array(siteUrl).max(20),
    frameOrigins: z.array(siteUrl).max(20),
    screen: screenOptions,
    block: blockOptions,
    shell: shellShape,
});
export const themeShape = z.strictObject({
    colors: z.strictObject({ light: palette, dark: palette }),
});
export const configShape = z.strictObject({
    content: contentShape,
    settings: settingsShape,
    theme: themeShape,
    api: apiShape,
    contract: contractShape,
});
export const configInputShape = z.strictObject({
    contents: contentsShape,
    settings: settingsShape.partial().extend({
        locale: settingsShape.shape.locale.partial().optional(),
        currency: settingsShape.shape.currency.partial().optional(),
        theme: settingsShape.shape.theme.partial().optional(),
        screen: screenOptions.partial().optional(),
        block: blockOptions.partial().optional(),
        shell: shellShape.partial().optional(),
    }).default({}),
    themes: z.strictObject({
        colors: z.strictObject({ light: palette.partial().optional(), dark: palette.partial().optional() }).optional(),
    }).default({}),
    contracts: z.strictObject({
        urls: z.strictObject({
            production: siteUrl.nullable(),
            local: siteUrl.nullable(),
            browser: siteUrl.nullable().default(null),
        }),
        options: connection.omit({ baseUrl: true, browserBaseUrl: true, development: true }).extend({
            prefix: prefix.default(""),
            spec: apiInputShape.shape.context.shape.spec,
            authCookie: apiInputShape.shape.context.shape.authCookie,
            proxies: apiInputShape.shape.context.shape.proxies,
            execution: overridesShape.shape.execution,
            encoding: overridesShape.shape.encoding,
            cache: overridesShape.shape.cache,
        }),
        request: overridesShape.shape.request,
        response: overridesShape.shape.response,
        realtime: apiInputShape.shape.realtime,
    }),
    features: overridesShape.shape.features,
});

type Input = z.input<typeof configInputShape>;
type Wire = Omit<ContractOverrides, "features" | "connection">;

export type SiteConfig = Omit<Input, "contracts" | "features"> & {
    contracts: Omit<Input["contracts"], "request" | "response"> & Pick<Wire, "request" | "response">;
    features?: ContractOverrides["features"];
};
export type CompiledConfig = z.infer<typeof configShape>;

