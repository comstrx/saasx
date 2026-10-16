import { rmSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";
import type { Files } from "./assets.ts";
import {
    brandImages,
    type Connection,
    type EngineAssets,
    type Mode,
    modeOf,
    publishAssets,
    publishedUrls,
    registryModule,
    routingOf,
    selectConnections,
    specAliases,
    syncEngineAssets,
} from "./compile.ts";
import { type Core, report, sha256, tally, task } from "./core.ts";
import type { Dictionaries } from "./messages.ts";
import type { Loaded, Loader } from "./specs.ts";

type ApiPart = { connections: Readonly<Record<string, Connection>> } | null;
type Settings = { locale: { enabled: string[]; default: string } };

export type Buildable = {
    config: { api: ApiPart; settings: Settings };
    schema: { screens: unknown[]; features: string[]; operations: string[] };
};
export type Prepared<C extends { config: { api: ApiPart }; schema: unknown }> = { config: C["config"]; schema: C["schema"] };
export type Built<C extends Buildable, L extends string> = Prepared<C> & { spec: Loaded<C, L>; assets: Files; mode: Mode; folder: string };
export type Emitted = {
    data?: Readonly<Record<string, unknown>> | undefined;
    modules?: Readonly<Record<string, string>> | undefined;
    registry?: readonly string[] | undefined;
    publish?: Files | undefined;
    meta?: Readonly<Record<string, unknown>> | undefined;
    note?: string | undefined;
};
export type BuildPlan<C extends Buildable, L extends string> = {
    brand: ( config: C["config"] ) => readonly (string | null)[];
    engine?: EngineAssets | undefined;
    keep?: readonly string[] | undefined;
    emit: ( built: Built<C, L> ) => Emitted | Promise<Emitted>;
};
export type Meta = { identity: string; aliases: Record<string, string> } & Record<string, unknown>;
export type Compile = ( mode: Mode ) => Promise<Meta>;

type Surface<C, L extends string> = Core & {
    loader: Loader<C, L>;
    assets: {
        paths: string[];
        files: ( folder: string, publicFiles?: boolean ) => Files;
        compose: ( publicFolder: string, brand: string ) => Files;
    };
};

export function prepareSpec<C extends { config: { api: ApiPart }; schema: unknown }> (
    spec: C,
    assets: ReadonlyMap<string,
    Uint8Array>,
    mode: Mode,
): Prepared<C> {

    const { api } = spec.config;
    const config = api ? { ...spec.config, api: { ...api, connections: selectConnections(api.connections, mode) } } : spec.config;

    return { config: publishedUrls(config, assets), schema: publishedUrls(spec.schema, assets) };

}
function moduleAlias ( file: string ): string {

    return `@spec/${file.endsWith(".js") ? file.slice(0, -3) : file}`;

}
export function defineBuild<C extends Buildable, L extends string> ( surface: Surface<C, L>, url: string, plan: BuildPlan<C, L> ): Compile {

    const { root, writeFile, writeJson, loader } = surface;
    const owned = ( name: string, paths: readonly string[] ) => paths.some(( path ) => name.startsWith(`${path}/`));
    const published = surface.assets.paths.filter(( path ) => !plan.keep?.includes(path));

    const compile: Compile = async ( mode ) => {

        const spec = await loader.loadSpec(loader.specFromEnvironment());
        const folder = `node_modules/.cache/spec/${mode}`;
        const assets = surface.assets.compose(resolve(root, "public"), resolve(spec.folder, "brand"));

        brandImages(plan.brand(spec.config), assets);

        if ( plan.engine ) syncEngineAssets(root, plan.engine);

        const prepared = prepareSpec(spec, assets, mode);
        const emitted = await plan.emit({ ...prepared, spec, assets, mode, folder });
        const messages: Dictionaries<L> = spec.messages;
        const data = {
            config: prepared.config,
            schema: prepared.schema,
            messages,
            routing: routingOf(prepared.config.settings),
            ...emitted.data,
        };
        const modules = { "registry.js": registryModule(root, folder, emitted.registry ?? spec.schema.features), ...emitted.modules };
        const shared = [...surface.assets.files(resolve(root, "public"), true)].filter(( [name] ) => !owned(name, surface.assets.paths));
        const release = [...shared, ...assets].map(( [path, bytes] ) => ({ path, sha256: sha256(bytes) }));

        rmSync(resolve(root, folder), { recursive: true, force: true });

        for ( const [name, value] of Object.entries(data) ) writeJson(`${folder}/${name}.json`, value);
        for ( const [file, source] of Object.entries(modules) ) writeFile(`${folder}/${file}`, source);

        writeJson(`${folder}/release.json`, { identity: spec.identity, files: release });
        publishAssets(root, published, new Map([...[...assets].filter(( [name] ) => owned(name, published)), ...(emitted.publish ?? [])]));

        const extra = Object.fromEntries(
            Object.keys(modules)
                .filter(( file ) => file !== "registry.js")
                .map(( file ) => [moduleAlias(file), file]),
        );
        const meta: Meta = { identity: spec.identity, ...emitted.meta, aliases: specAliases(root, folder, Object.keys(data), extra) };

        writeJson(`${folder}/meta.json`, meta);
        report(`Compiled ${spec.identity}: ${tally(spec.schema)}, ${assets.size} spec assets${emitted.note ? `, ${emitted.note}` : ""}.`);

        return meta;

    };

    task(url, async () => {

        await compile(modeOf(process.argv[2]));

    });

    return compile;

}
