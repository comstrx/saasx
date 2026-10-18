import {
    type Children,
    type CompiledBlock,
    type CompiledFeature,
    countShape,
    createSpecSurface,
    specText,
    stepShape,
} from "engine/spec";
import { key, z } from "engine/validate";
import { iconNames } from "engine/world";
import { core } from "../../api/core/index.ts";
import { endpoints, entities } from "../../api/features/index.ts";
import { supportedLocales } from "./languages.ts";
import { currency, themeDefaults } from "./theme.ts";

const count = countShape(6);
const identifier = z.string().regex(/^[A-Za-z][A-Za-z0-9-]*(?:\.[A-Za-z][A-Za-z0-9-]*)+$/);
const permission = z.string().regex(/^[a-z][a-z0-9-]*(?::[a-z][a-z0-9-]*)*$/);
const pixels = z.number().int().min(320).max(16384);

export const surface = createSpecSurface({
    kind: "web",
    locales: supportedLocales,
    entities,
    icons: iconNames,
    brand: {
        images: "/images/brand",
        imageFormats: ["png", "webp", "jpg", "jpeg", "svg"],
        fontFormats: ["woff2", "woff", "ttf", "otf"],
        fontWeight: /^[1-9]00(?: [1-9]00)?$/,
    },
    screenOptions: z.strictObject({
        title: z.boolean(),
        nav: z.boolean(),
        sidebar: z.boolean(),
        footer: z.boolean(),
        loader: z.boolean(),
        scroll: z.boolean(),
    }),
    blockOptions: z.strictObject({
        width: z.enum(["auto", "full", "half", "third", "two-thirds", "quarter", "narrow", "wide"]),
        height: z.enum(["auto", "screen"]),
        grid: z.union([count, z.partialRecord(z.enum(["base", "sm", "md", "lg", "xl"]), count)]),
        sizes: z.array(z.number().int().min(1).max(12)).max(12),
        gap: stepShape,
        padding: stepShape,
        align: z.enum(["start", "center", "end", "stretch"]),
        tone: z.enum(["default", "surface", "primary", "inverse"]),
        radius: z.enum(["none", "sm", "md", "lg", "xl"]),
        shadow: z.enum(["none", "sm", "md", "lg"]),
    }),
    shell: ["nav", "sidebar", "footer", "loader"],
    contents: { description: specText.optional() },
    settings: {
        app: z.strictObject({ slug: key, identifier }),
        window: z.strictObject({
            width: pixels,
            height: pixels,
            minWidth: pixels,
            minHeight: pixels,
            resizable: z.boolean(),
            decorations: z.boolean(),
        }),
        permissions: z.array(permission).max(64),
    },
    required: ["app"],
    themeDefaults,
    settingsDefaults: {
        currency,
        window: { width: 1280, height: 800, minWidth: 720, minHeight: 480, resizable: true, decorations: true },
        permissions: [],
        screen: { title: true, nav: true, sidebar: false, footer: false, loader: true, scroll: true },
        block: {
            width: "full",
            height: "auto",
            grid: 1,
            sizes: [],
            gap: 6,
            padding: 0,
            align: "stretch",
            tone: "default",
            radius: "none",
            shadow: "none",
        },
        shell: { nav: null, sidebar: null, footer: null, loader: null },
    },
    environment: process.env,
    contracts: { browser: false, options: {}, dropped: ["baseUrl", "browserBaseUrl", "browser", "development"] },
});

export const {
    configShape,
    configInputShape,
    schemaShape,
    screenOptions,
    blockOptions,
    shellShape,
    settingsShape,
    contentShape,
    entityRoute,
} = surface;
export const {
    defineConfig,
    defineSchema,
    screen,
    block,
    feature,
    t,
    read,
    write,
    data,
    site,
    param,
    query,
    signal,
    live,
    env,
} = surface.define;

export const validateSpec = surface.validator({
    reserved: /^\/(?:_|\+|\(|api(?:\/|$))/,
    endpoints,
    core,
    walk: () => ({ client: true, session: true }),
    screen: () => ({}),
    featureIssues: ( features ) => Object.entries(features)
        .filter(( [, manifest] ) => manifest.owner !== "client")
        .map(( [name] ) => `features/${name}: a desk feature is client-owned.`),
    schema: () => ({}),
});

export type SiteConfig = z.input<typeof configInputShape>;
export type CompiledConfig = z.output<typeof configShape>;
export type SiteSchemaInput = z.input<typeof schemaShape>;
export type Compiled = ReturnType<typeof validateSpec>;
export type CompiledSchema = Compiled["schema"];
export type CompiledScreen = CompiledSchema["screens"][number];
export type ScreenOptions = z.output<typeof screenOptions>;
export type BlockOptions = z.output<typeof blockOptions>;
export type Shell = z.output<typeof shellShape>;
export type Tree = Children<BlockOptions>;
export type CompiledDeskBlock = CompiledBlock<BlockOptions>;
export type CompiledDeskFeature = CompiledFeature<BlockOptions>;
