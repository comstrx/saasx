import { resolveApi } from "../../api/core/resolve.ts";
import { entities, permissions } from "../../api/features/index.ts";
import type { z } from "../providers/schema.ts";
import { type Messages, messageAt } from "../std/messages.ts";
import { compact, mapValues } from "../std/object.ts";
import { patternKeys } from "../std/route.ts";
import { type CompiledConfig, configInputShape, configShape } from "./contract.ts";
import { settingsDefaults, themeDefaults } from "./defaults.ts";
import { isSpecKey } from "./fields.ts";
import { type Locale, supportedLocales } from "./languages.ts";
import {
    type CompiledBlock, type CompiledFeature, type CompiledSchema, type CompiledScreen, type ScreenOptions, type SiteBlock,
    type SiteFeature, type SiteScreen, schemaShape,
} from "./screens.ts";

type FeatureFacts = { client: boolean; options: Record<string, unknown> };
type Features = Readonly<Record<string, FeatureFacts>>;

type Input = z.output<typeof configInputShape>;
type Settings = ReturnType<typeof mergeSettings>;
type Contracts = Input["contracts"];
type Options = Record<string, unknown>;
type Walk = {
    issues: string[];
    ids: Set<string>;
    used: Set<string>;
    headings: number;
    client: boolean;
    settings: CompiledConfig["settings"];
    features: Features;
};

const reserved = new RegExp(`^/(?:api|_next|_not-found|_generated|assets|${supportedLocales.join("|")})(?:/|$)`);

function translations ( value: unknown, locales: readonly Locale[], messages: Record<Locale, Messages>, path: string, issues: string[] ): void {

    if ( isSpecKey(value) ) {

        for ( const locale of locales ) {

            if ( messageAt(messages[locale], value.key) === undefined ) {

                issues.push(`${path}: missing ${locale} message "${value.key}".`);

            }

        }

        return;

    }
    if ( !value || typeof value !== "object" ) {

        return;

    }
    for ( const [key, child] of Object.entries(value) ) {

        translations(child, locales, messages, `${path}.${key}`, issues);

    }

}
function kind ( value: unknown ): string {

    return value === null ? "null" : Array.isArray(value) ? "array" : isSpecKey(value) ? "string" : typeof value;

}
function isOptions ( value: unknown ): value is Options {

    return kind(value) === "object";

}
function optionIssues ( given: Options, defaults: Options, feature: string, where: string ): string[] {

    return Object.entries(given).flatMap(( [name, value] ) => {

        if ( !Object.hasOwn(defaults, name) ) return [`${where}: feature ${feature} has no option ${name}.`];

        const expected = kind(defaults[name]);
        const fallback = defaults[name];

        if ( expected === "null" || value === null ) return [];
        if ( expected !== kind(value) ) return [`${where}: option ${name} of ${feature} takes ${expected}, not ${kind(value)}.`];

        return isOptions(value) && isOptions(fallback) ? optionIssues(value, fallback, feature, `${where}.${name}`) : [];

    });

}
function merged ( defaults: Options, given: Options ): Options {

    return { ...defaults, ...mapValues(given, ( value, name ) => deeper(defaults[name], value)) };

}
function deeper ( base: unknown, value: unknown ): unknown {

    return isOptions(base) && isOptions(value) ? merged(base, value) : value;

}
function missing ( name: string, where: string ): string {

    return `${where}: no feature named ${name} under src/features.`;

}
function featureIssues ( { name, options = {} }: SiteFeature, walk: Walk, where: string ): string[] {

    const facts = walk.features[name];

    if ( !facts ) return [missing(name, where)];

    const needed = (permissions[name as keyof typeof permissions] ?? []).length > 0;
    const server = !facts.client;

    return [
        ...(walk.client && server ? [`${where}: a client-rendered screen needs client-owned features; ${name} is server-owned.`] : []),
        ...(needed && server ? [`${where}: ${name} needs permissions, so its entry must be client-owned ("use client").`] : []),
        ...optionIssues(options, facts.options, name, where),
    ];

}
function claim ( walk: Walk, id: string, where: string ): string {

    if ( walk.ids.has(id) ) walk.issues.push(`${where}: duplicate id ${id}.`);

    walk.ids.add(id);

    return id;

}
function compileFeature ( entry: SiteFeature, walk: Walk, where: string ): CompiledFeature {

    const facts = walk.features[entry.name];

    walk.issues.push(...featureIssues(entry, walk, where));
    walk.used.add(entry.name);

    if ( entry.heading ) walk.headings += 1;

    return {
        name: entry.name,
        id: claim(walk, entry.id ?? where, where),
        heading: entry.heading ?? false,
        options: merged(facts?.options ?? {}, entry.options ?? {}),
        features: (entry.features ?? []).map(( child, index ) => compileFeature(child, walk, `${where}.features[${index}]`)),
        blocks: (entry.blocks ?? []).map(( child, index ) => compileBlock(child, walk, `${where}.blocks[${index}]`)),
    };

}
function compileBlock ( block: SiteBlock, walk: Walk, where: string ): CompiledBlock {

    return {
        id: claim(walk, block.id ?? where, where),
        options: { ...walk.settings.block, ...block.options },
        features: (block.features ?? []).map(( child, index ) => compileFeature(child, walk, `${where}.features[${index}]`)),
        blocks: (block.blocks ?? []).map(( child, index ) => compileBlock(child, walk, `${where}.blocks[${index}]`)),
    };

}
function compileScreen ( screen: SiteScreen, settings: CompiledConfig["settings"], features: Features, issues: string[] ): CompiledScreen {

    const { name } = screen.contents;
    const options: ScreenOptions = { ...settings.screen, ...screen.options };
    const walk: Walk = { issues, ids: new Set(), used: new Set(), headings: 0, client: options.render === "client", settings, features };
    const blocks = screen.blocks.map(( block, index ) => compileBlock(block, walk, `${name}.blocks[${index}]`));

    if ( blocks.length && walk.headings !== 1 ) issues.push(`${name}: exactly one feature owns the screen heading.`);
    if ( !options.seo && options.index ) options.index = false;

    for ( const part of ["nav", "footer", "sidebar", "loader"] as const ) {

        if ( options[part] && settings.shell[part] ) walk.used.add(settings.shell[part]);

    }

    return { ...screen.contents, options, blocks, features: [...walk.used].sort() };

}
function mergeSettings ( input: Input["settings"] ) {

    return {
        ...settingsDefaults, ...input,
        locale: { ...settingsDefaults.locale, ...input.locale },
        currency: { ...settingsDefaults.currency, ...input.currency },
        theme: { ...settingsDefaults.theme, ...input.theme },
        fonts: { ...settingsDefaults.fonts, ...input.fonts },
        screen: { ...settingsDefaults.screen, ...input.screen },
        block: { ...settingsDefaults.block, ...input.block },
        shell: { ...settingsDefaults.shell, ...input.shell },
    };

}
function mergeTheme ( input: Input["themes"] ) {

    return {
        colors: {
            light: { ...themeDefaults.colors.light, ...input.colors?.light },
            dark: { ...themeDefaults.colors.dark, ...input.colors?.dark },
        },
    };

}
function settingsResource ( settings: Settings ) {

    return {
        language: settings.locale.default, languages: settings.locale.enabled, time_zone: settings.locale.timeZone,
        currency: settings.currency.default, currencies: settings.currency.enabled,
        theme: settings.theme.default, themes: settings.theme.enabled,
        motion: settings.motion, density: settings.density,
        maintenance: settings.maintenance, maintenance_message: settings.maintenanceMessage,
    };

}
function at ( origin: string | null, path: string ): string | null {

    return origin === null ? null : path ? `${origin}/${path}` : origin;

}
function connection ( { urls, options }: Contracts, path: string ) {

    const { browser, timeoutMs, retries, maxResponseBytes, credentials } = options;

    return {
        ...compact({ browser, timeoutMs, retries, maxResponseBytes, credentials }),
        baseUrl: at(urls.production, path),
        browserBaseUrl: at(urls.browser, path),
        development: { baseUrl: at(urls.local, path), browserBaseUrl: at(urls.browser, path) },
    };

}
function document ( { infos, urls, logos, address, contacts, links, seo = {} }: Input["contents"] ) {

    return { content: { ...infos, ...urls, ...logos, ...address, ...contacts, ...links }, seo };

}
function compile ( input: Input ): CompiledConfig {

    const { contracts } = input;
    const { spec, authCookie, proxies, prefix, execution, encoding, cache } = contracts.options;
    const { seo, content } = document(input.contents);
    const settings = mergeSettings(input.settings);
    const seeds = { content, seo, settings: settingsResource(settings) };
    const api = {
        context: { spec, authCookie, proxies, currency: settings.currency.default },
        connections: { primary: connection(contracts, prefix), broadcast: connection(contracts, "") },
        realtime: contracts.realtime,
    };
    const overrides = { execution, encoding, cache, request: contracts.request, response: contracts.response, features: input.features };

    return configShape.parse({
        content: { ...content, seo }, settings, theme: mergeTheme(input.themes),
        ...resolveApi(api, compact(overrides), seeds),
    });

}
function choiceIssues ( { locale, currency, theme }: CompiledConfig["settings"] ): string[] {

    return Object.entries({ locale, currency, theme }).flatMap(( [name, choice] ) => [
        ...(new Set(choice.enabled).size !== choice.enabled.length ? [`settings.${name}.enabled contains duplicates.`] : []),
        ...(!choice.enabled.some(( value ) => value === choice.default) ? [`settings.${name}.default must be enabled.`] : []),
    ]);

}
function articleIssues ( { contents: { article, path } }: SiteScreen ): string[] {

    if ( !article?.modifiedAt || Date.parse(article.modifiedAt) >= Date.parse(article.publishedAt) ) return [];

    return [`${path}: modifiedAt precedes publishedAt.`];

}
function entityIssues ( { contents: { entity, path } }: SiteScreen ): string[] {

    if ( !entity ) return [];

    const kind = typeof entity === "string" ? entity : entity.kind;
    const parameter = (typeof entity === "string" ? undefined : entity.parameter) ?? entities[kind].parameter;

    return patternKeys(path).includes(parameter) ? [] : [`${path}: the ${kind} screen needs :${parameter} in its path.`];

}
function shellOptions ( shell: CompiledConfig["settings"]["shell"], features: Features ): CompiledSchema["shell"] {

    const of = ( name: string | null ): Options => (name ? features[name]?.options ?? {} : {});

    return { nav: of(shell.nav), footer: of(shell.footer), sidebar: of(shell.sidebar), loader: of(shell.loader) };

}
function shellIssues ( settings: CompiledConfig["settings"], features: Features ): string[] {

    return Object.entries(settings.shell).flatMap(( [part, name] ) => {

        return name === null || features[name] ? [] : [missing(name, `settings.shell.${part}`)];

    });

}
function screenIssues ( screens: readonly SiteScreen[] ): string[] {

    const issues: string[] = [];
    const names = new Set<string>();
    const paths = new Set<string>();

    for ( const screen of screens ) {

        const { name, path } = screen.contents;

        if ( names.has(name) ) issues.push(`Duplicate screen name: ${name}`);
        if ( paths.has(path) ) issues.push(`Duplicate screen path: ${path}`);
        if ( reserved.test(path) ) issues.push(`Reserved screen path: ${path}`);

        names.add(name);
        paths.add(path);
        issues.push(...articleIssues(screen), ...entityIssues(screen));

    }

    if ( screens.length && !paths.has("/") ) issues.push("schema.screens must declare the home path /.");

    return issues;

}
export function validateSpec (
    rawConfig: unknown,
    rawSchema: unknown,
    messages: Record<Locale, Messages>,
    features: Features = {},
): { config: CompiledConfig; schema: CompiledSchema } {

    const config = compile(configInputShape.parse(rawConfig));
    const declared = schemaShape.parse(rawSchema);
    const issues = [...choiceIssues(config.settings), ...shellIssues(config.settings, features), ...screenIssues(declared.screens)];
    const screens = declared.screens.map(( screen ) => compileScreen(screen, config.settings, features, issues));
    const used = [...new Set(screens.flatMap(( screen ) => screen.features))].sort();
    const schema: CompiledSchema = { screens, features: used, shell: shellOptions(config.settings.shell, features) };

    translations(screens, config.settings.locale.enabled, messages, "schema", issues);

    if ( issues.length ) throw new Error(issues.join("\n"));

    return { config, schema };

}
