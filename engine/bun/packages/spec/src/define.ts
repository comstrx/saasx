import type { Binding, Input, Live, Reference, SiteBlock, SiteFeature } from "./shapes.ts";

export type Children<B> = (SiteFeature<B> | SiteBlock<B>)[];
export type FeatureSettings<B> = Omit<SiteFeature<B>, "name" | "features" | "blocks">;

function isFeature<B>(child: SiteFeature<B> | SiteBlock<B>): child is SiteFeature<B> {
    return "name" in child;
}
function isBlock<B>(child: SiteFeature<B> | SiteBlock<B>): child is SiteBlock<B> {
    return !("name" in child);
}
export function split<B>(children: Children<B>): { features: SiteFeature<B>[]; blocks: SiteBlock<B>[] } {
    return {
        features: children.filter(isFeature),
        blocks: children.filter(isBlock),
    };
}
export function block<B>(options: Partial<B>, children: Children<B> = []): SiteBlock<B> {
    return { options, ...split(children) };
}
export function feature<B>(
    name: string,
    settings: FeatureSettings<B> = {},
    children: Children<B> = [],
): SiteFeature<B> {
    return { name, ...settings, ...split(children) };
}
export function t(key: string): { key: string } {
    return { key };
}
export function read(operation: string, input?: Input, live?: Live): Binding {
    return { read: operation, ...(input ? { input } : {}), ...(live ? { live } : {}) };
}
/**
 * A read port that reloads whenever one of the given events (any event when none is named)
 * arrives on the channel; the surface's realtime contract carries where the channel lives.
 */
export function live(
    channel: string,
    events: string[] = [],
    patch?: string | { path: string; key?: string; version?: string },
): Live {
    const normalized = typeof patch === "string" ? { path: patch } : patch;

    return {
        channel,
        events,
        ...(normalized
            ? {
                  patch: {
                      path: normalized.path,
                      key: normalized.key ?? "id",
                      ...(normalized.version ? { version: normalized.version } : {}),
                  },
              }
            : {}),
    };
}
/**
 * A write port; `fields` names (and orders) the inputs a form edits, else every unbound input.
 */
export function write(operation: string, input?: Input, fields?: string[]): Binding {
    return { write: operation, ...(input ? { input } : {}), ...(fields ? { fields } : {}) };
}
export function data(value: Record<string, unknown>[] | Record<string, unknown>): Binding {
    return { data: value };
}
export function site(field = "$"): Binding {
    return { site: field };
}
export function param(name: string): Reference {
    return { param: name };
}
export function query(name: string): Reference {
    return { query: name };
}
/**
 * A port input taken from a signal another feature on the screen emits; a waiting reference holds
 * the port idle until the signal carries a value.
 */
export function signal(name: string, options: { wait?: boolean } = {}): Reference {
    return options.wait ? { signal: name, wait: true } : { signal: name };
}
export type Helpers<B> = {
    block: (options: Partial<B>, children?: Children<B>) => SiteBlock<B>;
    feature: (name: string, settings?: FeatureSettings<B>, children?: Children<B>) => SiteFeature<B>;
    t: typeof t;
    read: typeof read;
    write: typeof write;
    data: typeof data;
    site: typeof site;
    param: typeof param;
    query: typeof query;
    signal: typeof signal;
    live: typeof live;
};

/**
 * The define helpers typed over one surface's block options, so every surface speaks the same
 * language with its own option vocabulary.
 */
export function helpers<B>(): Helpers<B> {
    return {
        block: (options, children = []) => block<B>(options, children),
        feature: (name, settings = {}, children = []) => feature<B>(name, settings, children),
        t,
        read,
        write,
        data,
        site,
        param,
        query,
        signal,
        live,
    };
}
export type ScreenOf<Schema> = Schema extends { screens: readonly (infer S)[] } ? S : never;
export type SurfaceHelpers<Config, Schema, B> = Helpers<B> & {
    defineConfig: <const T extends Config>(config: T) => T;
    defineSchema: <const T extends Schema>(schema: T) => T;
    screen: <const T extends ScreenOf<Schema>>(input: T) => T;
};

/**
 * Everything a spec author imports, typed over one surface's config, schema and block options.
 */
export function defineSurface<Config, Schema, B>(): SurfaceHelpers<Config, Schema, B> {
    return {
        ...helpers<B>(),
        defineConfig: (config) => config,
        defineSchema: (schema) => schema,
        screen: (input) => input,
    };
}
