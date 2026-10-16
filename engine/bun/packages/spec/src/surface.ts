import type { ApiInput, ContractOverrides, Layer } from "engine/api";
import { compact } from "engine/base";
import type { Messages } from "engine/translate";
import type { z } from "engine/validate";
import type { Catalogue, Features } from "./compile.ts";
import { translationIssues } from "./facts.ts";
import { stateIssues } from "./options.ts";
import { type Entities, type EntityRef, entityRoute } from "./schema.ts";
import {
    type ApiPlan,
    address,
    assertClean,
    type Backend,
    type CompiledScreen,
    choiceIssues,
    claimShell,
    compileApi,
    compileScreen,
    compileShell,
    iconIssues,
    mergeSettings,
    type Settings,
    type ShellPart,
    schemaFacts,
    screenIssues,
    settingsResource,
    shellIssues,
} from "./settings.ts";
import type { Access, CompiledBlock, SiteBlock } from "./shapes.ts";

type Patch = Record<string, unknown>;

export type Palette = Record<string, string>;
export type Theme = { colors: { light: Palette; dark: Palette } };
export type ThemeInput = { colors?: { light?: Palette | undefined; dark?: Palette | undefined } | undefined };
export type SurfaceConfig = {
    content: Readonly<Record<string, unknown>>;
    settings: Settings & { screen: Record<string, unknown>; block: object };
    api: { context: { sessionCookie: string | null } } | null;
    realtime: { url: string; key: string; protocol: "pusher" } | null;
    assets: string | null;
};
export type ConfigInputBase = {
    contents: { seo?: Record<string, unknown> | undefined; [key: string]: unknown };
    settings: Patch;
    themes: ThemeInput;
    contracts: unknown;
    features: ContractOverrides["features"];
};
export type ScreenInputBase<B extends object> = {
    contents: { name: string; path: string };
    options?: Record<string, unknown> | undefined;
    access?: unknown;
    redirect?: string | null | undefined;
    blocks: SiteBlock<B>[];
};
export type ContractsInput = {
    urls: { production: string | null; local: string | null; browser?: string | null | undefined };
    realtime?: { url: string; key: string; protocol: "pusher" } | null | undefined;
    assets?: string | null | undefined;
    options: {
        prefix: string;
        execution?: unknown;
        encoding?: unknown;
        cache?: unknown;
        sessionCookie?: string | null | undefined;
        proxies?: number | undefined;
        tenant?: string | null | undefined;
        insecure?: boolean | undefined;
        [extra: string]: unknown;
    };
    request?: unknown;
    response?: unknown;
};
export type Validator<C, M> = (
    identity: string,
    config: unknown,
    schema: unknown,
    messages: Readonly<Record<string, Messages>>,
    features: Features,
    catalogue: Catalogue,
) => { config: C; schema: M };
export type Surface<
    C extends SurfaceConfig,
    I extends ConfigInputBase,
    S extends ScreenInputBase<B>,
    O extends { features: string[]; operations: string[] },
    M,
    B extends object,
> = {
    reserved: RegExp;
    endpoints: ApiPlan["endpoints"];
    entities?: Entities | undefined;
    icons?: readonly string[] | undefined;
    core?: Layer | undefined;
    configShape: z.ZodType<C>;
    configInputShape: z.ZodType<I>;
    schemaShape: z.ZodType<{ screens: S[] }>;
    settingsDefaults: Patch;
    themeDefaults: Theme;
    backend: ( identity: string, contracts: NonNullable<I["contracts"]>, currency: string ) => Backend;
    walk: ( screen: S, options: Record<string, unknown>, config: C ) => { client: boolean; session: boolean };
    screen: (
        screen: S,
        options: Record<string, unknown>,
        config: C,
        compiled: CompiledScreen<B>,
        issues: string[],
    ) => O;
    screenIssues?: (( screens: readonly S[] ) => string[]) | undefined;
    featureIssues?: (( features: Features ) => string[]) | undefined;
    schema: (
        screens: O[],
        facts: { features: string[]; operations: string[] },
        shell: Record<string, ShellPart>,
    ) => M;
};
export type SurfaceInput = {
    identity: string;
    config: unknown;
    schema: unknown;
    messages: Readonly<Record<string, Messages>>;
    features: Features;
    catalogue: Catalogue;
};

export function backendOf ( identity: string, contracts: ContractsInput, currency: string ): Backend {

    const {
        prefix,
        execution,
        encoding,
        cache,
        sessionCookie = null,
        proxies = 0,
        tenant = null,
        insecure = false,
        ...extras
    } = contracts.options;
    const browser = contracts.urls.browser === undefined ? undefined : address(contracts.urls.browser, prefix);
    const development = { baseUrl: address(contracts.urls.local, prefix), browserBaseUrl: browser ?? null };
    const primary = {
        ...compact(extras),
        baseUrl: address(contracts.urls.production, prefix),
        ...(browser === undefined ? {} : { browserBaseUrl: browser }),
        development,
    } as ApiInput["connections"][string];

    return {
        api: { context: { spec: identity, sessionCookie, proxies, tenant, currency }, connections: { primary } },
        overrides: compact({
            execution,
            encoding,
            cache,
            request: contracts.request,
            response: contracts.response,
        }) as ContractOverrides,
        development,
        insecure,
    };

}
const cleartext = /^(?:http|ws):\/\//i;

export function transportIssues ( contracts: ContractsInput ): string[] {

    if ( contracts.options.insecure === true ) return [];

    const found = [
        ...(contracts.urls.production && cleartext.test(contracts.urls.production) ? ["urls.production"] : []),
        ...(contracts.realtime?.url && cleartext.test(contracts.realtime.url) ? ["realtime.url"] : []),
        ...(contracts.assets && cleartext.test(contracts.assets) ? ["assets"] : []),
    ];

    return found.map(( where ) => `contracts.${where}: a cleartext address in production needs options.insecure: true.`);

}

export type CompiledShape<S extends ScreenInputBase<object>, O, B extends object> = S["contents"] & {
    options: O;
    access: Access;
    redirect: string | null;
    blocks: CompiledBlock<B>[];
    features: string[];
    operations: string[];
};

export function compiledScreen<S extends ScreenInputBase<B>, O, B extends object> (
    screen: S,
    options: O,
    compiled: CompiledScreen<B>,
): CompiledShape<S, O, B> {

    return {
        ...(screen.contents as S["contents"]),
        options,
        access: (screen.access ?? "any") as Access,
        redirect: screen.redirect ?? null,
        blocks: compiled.blocks,
        features: [...compiled.walk.used].sort(),
        operations: [...compiled.walk.operations].sort(),
    };

}
export function mergeTheme ( defaults: Theme, input: ThemeInput ): Theme {

    return {
        colors: {
            light: { ...defaults.colors.light, ...input.colors?.light },
            dark: { ...defaults.colors.dark, ...input.colors?.dark },
        },
    };

}
function compileConfig<
    C extends SurfaceConfig,
    I extends ConfigInputBase,
    S extends ScreenInputBase<B>,
    O extends { features: string[]; operations: string[] },
    M,
    B extends object,
> ( surface: Surface<C, I, S, O, M, B>, identity: string, raw: unknown ): C {

    const input = surface.configInputShape.parse(raw);
    const { seo = {}, ...contents } = input.contents;
    const settings = mergeSettings(surface.settingsDefaults as Settings & Patch, input.settings);
    const currency = settings.currency.default;
    const seeds = { content: { ...contents, seo }, settings: settingsResource(settings) };
    const backend = input.contracts
        ? surface.backend(identity, input.contracts as NonNullable<I["contracts"]>, currency)
        : null;

    if ( input.contracts ) assertClean(transportIssues(input.contracts as ContractsInput));

    const { api, contract } = compileApi({
        identity,
        endpoints: surface.endpoints,
        seeds,
        currency,
        backend,
        switches: input.features,
        core: surface.core,
    });

    return surface.configShape.parse({
        content: seeds.content,
        settings,
        theme: mergeTheme(surface.themeDefaults, input.themes),
        api,
        contract,
        realtime: (input.contracts as ContractsInput | null)?.realtime ?? null,
        assets: (input.contracts as ContractsInput | null)?.assets ?? null,
        insecure: backend?.insecure ?? false,
    });

}
export function compileSurface<
    C extends SurfaceConfig,
    I extends ConfigInputBase,
    S extends ScreenInputBase<B>,
    O extends { features: string[]; operations: string[] },
    M,
    B extends object,
> ( surface: Surface<C, I, S, O, M, B>, input: SurfaceInput ): { config: C; schema: M } {

    const { identity, messages, features, catalogue } = input;
    const config = compileConfig(surface, identity, input.config);
    const declared = surface.schemaShape.parse(input.schema);
    const issues = [
        ...choiceIssues(config.settings),
        ...shellIssues(config.settings.shell, features),
        ...stateIssues(features),
        ...(surface.featureIssues?.(features) ?? []),
        ...screenIssues(declared.screens, surface.reserved),
        ...iconIssues(declared.screens as { contents: { name: string; icon?: string | null } }[], surface.icons),
        ...(surface.screenIssues?.(declared.screens) ?? []),
    ];
    const screens = declared.screens.map(( screen ) => {

        const options = { ...config.settings.screen, ...compact(screen.options ?? {}) };
        const { client, session } = surface.walk(screen, options, config);
        const compiled = compileScreen<B>({
            name: screen.contents.name,
            path: screen.contents.path,
            blocks: screen.blocks,
            access: screen.access ?? "any",
            redirect: screen.redirect,
            issues,
            client,
            session,
            backend: config.api !== null,
            realtime: config.realtime !== null,
            block: config.settings.block as B,
            site: config.content,
            features,
            catalogue,
        });

        const route = surface.entities
            ? entityRoute(surface.entities, screen.contents as { entity?: EntityRef | undefined; path: string })
            : null;

        if ( route && !compiled.walk.params.includes(route.parameter) ) {

            issues.push(`${screen.contents.path}: the ${route.kind} screen needs :${route.parameter} in its path.`);

        }

        claimShell(compiled.walk, options, config.settings.shell);

        return surface.screen(screen, options, config, compiled, issues);

    });
    const shell = compileShell(config.settings.shell, features);
    const schema = surface.schema(screens, schemaFacts(screens), shell);

    issues.push(...translationIssues(screens, config.settings.locale.enabled, messages, "schema"));
    issues.push(...translationIssues(shell, config.settings.locale.enabled, messages, "settings.shell"));
    assertClean(issues);

    return { config, schema };

}
export function surfaceValidator<
    C extends SurfaceConfig,
    I extends ConfigInputBase,
    S extends ScreenInputBase<B>,
    O extends { features: string[]; operations: string[] },
    M,
    B extends object,
> ( surface: Surface<C, I, S, O, M, B> ): Validator<C, M> {

    return ( identity, config, schema, messages, features, catalogue ) =>
        compileSurface(surface, { identity, config, schema, messages, features, catalogue });

}
