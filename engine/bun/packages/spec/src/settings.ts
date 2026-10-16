import {
    type ApiConfig,
    type ApiInput,
    type Connection,
    type Contract,
    type ContractOverrides,
    type Endpoint,
    type Layer,
    resolveApi,
    type Seeds,
} from "engine/api";
import { unique } from "engine/array";
import { compact, deepMerge, isRecord, mapValues } from "engine/base";
import { patternKeys } from "engine/parse";
import {
    type Catalogue,
    compileBlock,
    createWalk,
    type Features,
    optionIssues,
    type Walk,
} from "./compile.ts";
import type { CompiledBlock, SiteBlock } from "./shapes.ts";

export type Choice = { default: string; enabled: string[] };
export type ShellValue = string | { feature: string; options?: Record<string, unknown> | undefined } | null;
export type ShellPart = { feature: string | null; options: Record<string, unknown> };
export type SettingsResource = {
    language: string;
    languages: string[];
    currency: string;
    currencies: string[];
    theme: string;
    themes: string[];
    maintenance: boolean;
    maintenance_message: string;
};
export type Settings = {
    locale: Choice;
    currency: Choice;
    theme: Choice;
    maintenance: boolean;
    maintenanceMessage: string;
    shell: Record<string, ShellValue>;
};
export type Contents = { name: string; path: string };
export type Declared = { contents: Contents };
export type Backend = {
    api: ApiInput;
    overrides: ContractOverrides;
    development: Connection["development"];

    insecure: boolean;
};
export type ApiPlan = {
    identity: string;
    endpoints: Readonly<Record<string, Readonly<Record<string, Endpoint>>>>;
    seeds: Seeds;
    currency: string;
    backend: Backend | null;
    switches: ContractOverrides["features"];
    core?: Layer | undefined;
};
export type Compiled = { api: ApiConfig | null; contract: Contract };
export type ScreenPlan<B extends object> = {
    name: string;
    path: string;
    blocks: readonly SiteBlock<B>[];
    access: unknown;
    redirect: string | null | undefined;
    issues: string[];
    client: boolean;
    session: boolean;
    backend: boolean;
    realtime?: boolean | undefined;
    block: B;
    site: Readonly<Record<string, unknown>>;
    features: Features;
    catalogue: Catalogue;
};
export type CompiledScreen<B extends object> = { walk: Walk<B>; blocks: CompiledBlock<B>[] };

type Patch = Record<string, unknown>;

export function mergeSettings<T extends Patch> ( defaults: T, given: Patch ): T {

    return {
        ...defaults,
        ...compact(given),
        ...Object.fromEntries(
            Object.entries(defaults)
                .filter(( [key, value] ) => isRecord(value) && isRecord(given[key]))
                .map(( [key, value] ) => [key, { ...(value as Patch), ...compact(given[key] as Patch) }]),
        ),
    } as T;

}
export function settingsResource ( settings: Settings ): SettingsResource {

    return {
        language: settings.locale.default,
        languages: settings.locale.enabled,
        currency: settings.currency.default,
        currencies: settings.currency.enabled,
        theme: settings.theme.default,
        themes: settings.theme.enabled,
        maintenance: settings.maintenance,
        maintenance_message: settings.maintenanceMessage,
    };

}
export function choiceIssues ({ locale, currency, theme }: Settings): string[] {

    return Object.entries({ locale, currency, theme }).flatMap(( [name, choice] ) => [
        ...(new Set(choice.enabled).size !== choice.enabled.length
            ? [`settings.${name}.enabled contains duplicates.`]
            : []),
        ...(choice.enabled.some(( value ) => value === choice.default)
            ? []
            : [`settings.${name}.default must be enabled.`]),
    ]);

}
export function shellFeature ( value: ShellValue ): string | null {

    return typeof value === "string" ? value : (value?.feature ?? null);

}
export function shellIssues ( shell: Record<string, ShellValue>, features: Features ): string[] {

    return Object.entries(shell).flatMap(( [part, value] ) => {

        const name = shellFeature(value);
        const manifest = name === null ? undefined : features[name];

        if ( name === null ) return [];
        if ( !manifest ) return [`settings.shell.${part}: no feature named ${name}.`];

        const given = typeof value === "object" && value ? (value.options ?? {}) : {};

        return optionIssues(given, manifest.options, name, `settings.shell.${part}`);

    });

}
export function compileShell<K extends string> ( shell: Record<K, ShellValue>, features: Features ): Record<K, ShellPart> {

    return mapValues(shell, ( value: ShellValue ) => {

        const feature = shellFeature(value);
        const defaults = feature ? (features[feature]?.options ?? {}) : {};
        const given = typeof value === "object" && value ? (value.options ?? {}) : {};

        return { feature, options: deepMerge(defaults, given) };

    }) as Record<K, ShellPart>;

}
export function screenIssues ( screens: readonly Declared[], reserved: RegExp ): string[] {

    const issues: string[] = [];
    const names = new Set<string>();
    const paths = new Set<string>();

    for (const {
        contents: { name, path },
    } of screens) {

        if ( names.has(name) ) issues.push(`Duplicate screen name: ${name}`);
        if ( paths.has(path) ) issues.push(`Duplicate screen path: ${path}`);
        if ( reserved.test(path) ) issues.push(`Reserved screen path: ${path}`);

        names.add(name);
        paths.add(path);

    }

    if ( screens.length && !paths.has("/") ) issues.push("schema.screens must declare the home path /.");

    return issues;

}
export function iconIssues (
    screens: readonly { contents: { name: string; icon?: string | null | undefined } }[],
    icons: readonly string[] | undefined,
): string[] {

    if ( !icons ) return [];

    return screens.flatMap(({ contents: { name, icon } }) =>
        icon && !icons.includes(icon) ? [`${name}: no icon named ${icon}; the surface knows ${icons.join(", ")}.`] : [],
    );

}
export function compileScreen<B extends object> ( plan: ScreenPlan<B> ): CompiledScreen<B> {

    const { name, path, issues } = plan;
    const walk = createWalk({
        issues,
        params: patternKeys(path),
        client: plan.client,
        session: plan.session,
        backend: plan.backend,
        realtime: plan.realtime ?? false,
        block: plan.block,
        site: plan.site,
        features: plan.features,
        catalogue: plan.catalogue,
    });
    const blocks = plan.blocks.map(( block, index ) => compileBlock(block, walk, `${name}.blocks[${index}]`));

    if ( blocks.length && walk.headings !== 1 ) issues.push(`${name}: exactly one feature owns the screen heading.`);

    for ( const signal of walk.consumed ) {

        if ( !walk.emitted.has(signal) )
            issues.push(`${name}: signal ${signal} is read but no feature on the screen emits it.`);

    }

    if ( plan.access !== "any" && !plan.redirect ) issues.push(`${name}: a gated screen names its redirect.`);

    return { walk, blocks };

}
export function claimShell<B> (
    walk: Walk<B>,
    options: Record<string, unknown>,
    shell: Record<string, ShellValue>,
): void {

    for ( const [part, value] of Object.entries(shell) ) {

        const name = shellFeature(value);

        if ( options[part] && name ) walk.used.add(name);

    }

}
export function address ( origin: string | null, path: string ): string | null {

    return origin === null ? null : path ? `${origin}/${path}` : origin;

}
export function compileApi ( plan: ApiPlan ): Compiled {

    const { identity, endpoints, seeds, currency, backend, switches, core = {} } = plan;

    if ( !backend ) {

        if ( Object.keys(switches ?? {}).length )
            throw new Error("features: a spec without contracts cannot switch operations.");

        const context = { spec: identity, currency, sessionCookie: null, proxies: 0, tenant: null };
        const { contract } = resolveApi(endpoints, { context, connections: {} }, {}, seeds, core);
        const features = mapValues(contract.features, ( operations ) =>
            mapValues(operations, () => ({ enabled: false as const })),
        );

        return { api: null, contract: { ...contract, features } };

    }

    const resolved = resolveApi(endpoints, backend.api, { ...backend.overrides, features: switches }, seeds, core);
    const connections = mapValues(resolved.api.connections, ( connection ) => ({
        ...connection,
        development: backend.development,
    }));

    return { api: { ...resolved.api, connections }, contract: resolved.contract };

}
export function schemaFacts ( screens: readonly { features: string[]; operations: string[] }[] ): {
    features: string[];
    operations: string[];
} {

    return {
        features: unique(screens.flatMap(( screen ) => screen.features)).sort(),
        operations: unique(screens.flatMap(( screen ) => screen.operations)).sort(),
    };

}
export function assertClean ( issues: readonly string[] ): void {

    if ( issues.length ) throw new Error(issues.join("\n"));

}
