import { unique } from "engine/array";
import { compact, deepMerge, isRecord } from "engine/base";
import { slugify } from "engine/string";
import type { FieldFact } from "engine/validate";
import { compilePorts, consumesSignal, emptyManifest } from "./binding.ts";
import { type Features, optionIssues, stateNames, stateTexts } from "./options.ts";
import type { CompiledBlock, CompiledFeature, CompiledPort, Manifest, SiteBlock, SiteFeature } from "./shapes.ts";

export type { Features } from "./options.ts";
export { optionIssues } from "./options.ts";

export type OperationFacts = {
    method: string;
    path: string;
    many: boolean;
    input: string[];
    fields: FieldFact[];
    output: string[];
    permissions: string[];
    touches: string[];
};
export type Catalogue = Readonly<Record<string, Readonly<Record<string, OperationFacts>>>>;
export type Site = Readonly<Record<string, unknown>>;
export type Walk<B> = {
    issues: string[];
    ids: Set<string>;
    slugs: Map<string, number>;
    consumed: Set<string>;
    emitted: Set<string>;
    used: Set<string>;
    operations: Set<string>;
    headings: number;
    params: readonly string[];
    client: boolean;
    session: boolean;
    backend: boolean;
    realtime?: boolean | undefined;
    block: B;
    site: Site;
    features: Features;
    catalogue: Catalogue;
};
export type WalkInput<B> = Pick<
    Walk<B>,
    "params" | "client" | "session" | "backend" | "realtime" | "block" | "site" | "features" | "catalogue"
> & {
    issues?: string[] | undefined;
};

function accessOf<B> (
    walk: Walk<B>,
    manifest: Manifest,
    entry: SiteFeature<B>,
    ports: Record<string, CompiledPort>,
): string[] {

    const bound = Object.values(ports).flatMap(( port ) =>
        port.kind === "read" ? (walk.catalogue[port.feature]?.[port.operation]?.permissions ?? []) : [],
    );

    return unique([...manifest.access, ...(entry.access ?? []), ...bound]).sort();

}
function slugOf<B> ( walk: Walk<B>, name: string, where: string ): string {

    const screen = where.split(".")[0] ?? "screen";
    const base = slugify(`${screen} ${name}`);
    const seen = walk.slugs.get(base) ?? 0;

    walk.slugs.set(base, seen + 1);

    return seen ? `${base}-${seen + 1}` : base;

}
function claim<B> ( walk: Walk<B>, id: string, where: string ): string {

    if ( walk.ids.has(id) ) walk.issues.push(`${where}: duplicate id ${id}.`);

    walk.ids.add(id);

    return id;

}
function ownershipIssues<B> (
    walk: Walk<B>,
    name: string,
    owner: Manifest["owner"],
    access: string[],
    writes: boolean,
    where: string,
): string[] {

    const server = owner === "server";

    return [
        ...(walk.client && server
            ? [`${where}: a client-rendered screen needs client-owned features; ${name} is server-owned.`]
            : []),
        ...(access.length && server && !walk.session
            ? [`${where}: ${name} is gated (${access.join(", ")}) but server-owned and no session is declared.`]
            : []),
        ...(writes && server ? [`${where}: ${name} writes, so it must be client-owned.`] : []),
    ];

}
export function compileFeature<B extends object> (
    entry: SiteFeature<B>,
    walk: Walk<B>,
    where: string,
): CompiledFeature<B> {

    const manifest = walk.features[entry.name] ?? emptyManifest;

    if ( !walk.features[entry.name] ) walk.issues.push(`${where}: no feature named ${entry.name} under src/features.`);

    const ports = compilePorts(walk, manifest, entry, where);
    const access = accessOf(walk, manifest, entry, ports);
    const writes = Object.values(ports).some(( port ) => port.kind === "write");

    walk.issues.push(...ownershipIssues(walk, entry.name, manifest.owner, access, writes, where));

    if ( consumesSignal(entry) && manifest.owner !== "client" ) {

        walk.issues.push(
            `${where}: a signal-driven or live port needs a client-owned feature; ${entry.name} is server-owned.`,
        );

    }

    for ( const name of manifest.signals ) walk.emitted.add(name);

    const given = entry.options ?? {};

    walk.issues.push(...optionIssues(given, manifest.options, entry.name, where));
    walk.used.add(entry.name);

    const options = deepMerge(manifest.options, { ...stateTexts(manifest, given), ...given });

    for ( const state of stateNames(manifest) ) {

        const value = options[state];

        if ( value === "" ) walk.issues.push(`${where}: ${entry.name} leaves its ${state} text empty.`);

        if ( isRecord(value) && !Object.keys(value).length )
            walk.issues.push(`${where}: ${entry.name} leaves its ${state} map empty.`);

    }

    if ( entry.heading ) walk.headings += 1;

    return {
        name: entry.name,
        id: claim(walk, entry.id ?? where, where),
        slug: slugOf(walk, entry.name, where),
        heading: entry.heading ?? false,
        owner: manifest.owner,
        access,
        options,
        ports,
        features: (entry.features ?? []).map(( child, index ) =>
            compileFeature(child, walk, `${where}.features[${index}]`),
        ),
        blocks: (entry.blocks ?? []).map(( child, index ) => compileBlock(child, walk, `${where}.blocks[${index}]`)),
    };

}
export function compileBlock<B extends object> ( block: SiteBlock<B>, walk: Walk<B>, where: string ): CompiledBlock<B> {

    return {
        id: claim(walk, block.id ?? where, where),
        options: { ...walk.block, ...compact(block.options) },
        features: (block.features ?? []).map(( child, index ) =>
            compileFeature(child, walk, `${where}.features[${index}]`),
        ),
        blocks: (block.blocks ?? []).map(( child, index ) => compileBlock(child, walk, `${where}.blocks[${index}]`)),
    };

}
export function createWalk<B extends object> ( input: WalkInput<B> ): Walk<B> {

    return {
        ...input,
        issues: input.issues ?? [],
        realtime: input.realtime ?? false,
        ids: new Set(),
        slugs: new Map(),
        consumed: new Set(),
        emitted: new Set(),
        used: new Set(),
        operations: new Set(),
        headings: 0,
    };

}
export function reads<B extends object> (
    blocks: readonly CompiledBlock<B>[],
    features: readonly CompiledFeature<B>[],
): boolean {

    const own = features.some(
        ( entry ) =>
            Object.values(entry.ports).some(( port ) => port.kind === "read") || reads(entry.blocks, entry.features),
    );

    return own || blocks.some(( block ) => reads(block.blocks, block.features));

}
