import { apiInputShape } from "@engine/api";
import { type Children, type CompiledBlock, type CompiledFeature, countShape, createSpecSurface, reads, siteUrl, specText, stepShape } from "@engine/spec";
import { iconNames } from "@engine/ui";
import { z } from "@engine/validate";
import { core } from "../../api/core/index.ts";
import { endpoints, entities } from "../../api/features/index.ts";
import { supportedLocales } from "./languages.ts";
import { currency, themeDefaults } from "./theme.ts";

const count = countShape(6);

export const surface = createSpecSurface({
    kind: "web",
    locales: supportedLocales,
    entities,
    icons: iconNames,
    brand: { images: "/images/brand", imageFormats: ["png", "webp", "jpg", "jpeg", "svg", "avif"], fontFormats: ["woff2", "woff", "ttf", "otf"], fontWeight: /^[1-9]00(?: [1-9]00)?$/ },
    screenOptions: z.strictObject({
        render: z.enum(["server", "client"]),
        title: z.boolean(),
        nav: z.boolean(),
        footer: z.boolean(),
        sidebar: z.boolean(),
        loader: z.boolean(),
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
    shell: ["nav", "footer", "sidebar", "loader"],
    contents: {
        description: specText,
        article: z.strictObject({
            publishedAt: z.iso.datetime({ offset: true }),
            modifiedAt: z.iso.datetime({ offset: true }).optional(),
            author: specText.optional(),
        }).optional(),
    },
    settings: { delivery: z.enum(["server", "static"]), frameOrigins: z.array(siteUrl).max(20) },
    themeDefaults,
    settingsDefaults: {
        currency,
        delivery: "server",
        frameOrigins: [],
        screen: { render: "server", title: true, nav: true, footer: true, sidebar: false, loader: true },
        block: { width: "full", height: "auto", grid: 1, sizes: [], gap: 6, padding: 0, align: "stretch", tone: "default", radius: "none", shadow: "none" },
        shell: { nav: null, footer: null, sidebar: null, loader: null },
    },
    contracts: {
        browser: true,
        options: { sessionCookie: apiInputShape.shape.context.shape.sessionCookie.default(null), proxies: apiInputShape.shape.context.shape.proxies.default(1) },
        dropped: ["baseUrl", "browserBaseUrl", "development"],
    },
});

export const { configShape, configInputShape, schemaShape, screenOptions, blockOptions, shellShape, settingsShape, contentShape, entityRoute } = surface;
export const { defineConfig, defineSchema, screen, block, feature, t, read, write, data, site, param, query, signal, live } = surface.define;

export const validateSpec = surface.validator({
    reserved: new RegExp(`^/(?:api|_next|_not-found|_generated|assets|${supportedLocales.join("|")})(?:/|$)`),
    endpoints,
    core,
    walk: ( _screen, options, config ) => ({ client: options.render === "client", session: config.api !== null && config.api.context.sessionCookie !== null }),
    screen: ( screen, options, config, compiled, issues ) => {

        const { name, path } = screen.contents;
        const access = screen.access ?? "any";
        const listed = config.content.seo.sitemap.some(( entry ) => entry === "*" || entry === name);

        if ( config.settings.delivery === "static" && compiled.walk.params.length ) issues.push(`${path}: a static delivery cannot build parameterised paths.`);
        if ( config.settings.delivery === "static" && options.render === "server" && reads(compiled.blocks, []) ) issues.push(`${name}: a static delivery renders backend reads in the browser; set render: "client".`);

        return { client: options.render === "client" || access !== "any", listed };

    },
    screenIssues: ( screens ) => screens.flatMap(( { contents: { path, article } } ) => (article?.modifiedAt && Date.parse(article.modifiedAt) < Date.parse(article.publishedAt) ? [`${path}: modifiedAt precedes publishedAt.`] : [])),
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
export type CompiledWebBlock = CompiledBlock<BlockOptions>;
export type CompiledWebFeature = CompiledFeature<BlockOptions>;
