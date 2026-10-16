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

export const surface = createSpecSurface({
    kind: "native",
    locales: supportedLocales,
    entities,
    icons: iconNames,
    brand: {
        images: "/images/brand",
        imageFormats: ["png", "webp", "jpg", "jpeg", "svg"],
        fontFormats: ["ttf", "otf"],
        fontWeight: /^[1-9]00$/,
    },
    screenOptions: z.strictObject({
        presentation: z.enum(["stack", "modal", "tab"]),
        title: z.boolean(),
        header: z.boolean(),
        tabs: z.boolean(),
        loader: z.boolean(),
        order: z.number().int().min(0).max(100),
        scroll: z.boolean(),
    }),
    blockOptions: z.strictObject({
        width: z.enum(["full", "boxed", "narrow"]),
        height: z.enum(["auto", "screen"]),
        grid: countShape(4),
        gap: stepShape,
        padding: stepShape,
        align: z.enum(["start", "center", "end", "stretch"]),
        tone: z.enum(["default", "surface", "primary", "inverse"]),
        radius: z.enum(["none", "sm", "md", "lg", "xl"]),
    }),
    shell: ["header", "tabs", "loader"],
    contents: { description: specText.optional() },
    settings: { app: z.strictObject({ slug: key, scheme: z.string().regex(/^[a-z][a-z0-9+.-]*$/) }) },
    required: ["app"],
    themeDefaults,
    settingsDefaults: {
        currency,
        screen: { presentation: "stack", title: true, header: true, tabs: false, loader: true, order: 50, scroll: true },
        block: { width: "full", height: "auto", grid: 1, gap: 4, padding: 4, align: "stretch", tone: "default", radius: "none" },
        shell: { header: null, tabs: null, loader: null },
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
    screen: ( screen, options, _config, compiled, issues ) => {

        if ( options.presentation === "tab" && compiled.walk.params.length ) {

            issues.push(`${screen.contents.name}: a tab screen has no path parameters.`);

        }

        return {};

    },
    featureIssues: ( features ) => Object.entries(features)
        .filter(( [, manifest] ) => manifest.owner !== "client")
        .map(( [name] ) => `features/${name}: a mobile feature is client-owned.`),
    schema: ( screens ) => ({
        tabs: screens
            .filter(( item ) => item.options.presentation === "tab")
            .sort(( a, b ) => a.options.order - b.options.order)
            .map(( item ) => item.name),
    }),
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
export type CompiledAppBlock = CompiledBlock<BlockOptions>;
export type CompiledAppFeature = CompiledFeature<BlockOptions>;
