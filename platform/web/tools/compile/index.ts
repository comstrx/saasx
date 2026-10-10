import { createHash } from "node:crypto";
import { relative, resolve } from "node:path";
import { packContract } from "../../src/api/core/pack.ts";
import { type BrowserConfig, browserConfig } from "../../src/api/core/resolve.ts";
import type { CompiledConfig } from "../../src/lib/spec/contract.ts";
import { entityRoute } from "../../src/lib/spec/screens.ts";
import { mapValues } from "../../src/lib/std/object.ts";
import { assetFiles, composeAssets, specPaths } from "../assets/index.ts";
import { report, root, sha256, writeFile, writeJson } from "../core/index.ts";
import { loadSpec, type Spec, specFromEnvironment } from "../specs/index.ts";
import { resolveTheme, themeCss } from "./theme.ts";

type Mode = "development" | "production";
type Endpoint = { baseUrl: string | null; development?: { baseUrl: string | null } };
type Assets = ReadonlyMap<string, Buffer>;

function select<T extends Endpoint> ( value: T, mode: Mode ): T {

    const { development, ...connection } = value;

    return { ...connection, ...(mode === "development" ? development : {}) } as T;

}
function forMode ( config: CompiledConfig, mode: Mode ): CompiledConfig {

    const connections = mapValues(config.api.connections, ( value ) => select(value, mode));

    return { ...config, api: { ...config.api, connections } };

}
function origins ( config: CompiledConfig, browser: BrowserConfig ) {

    const reachable = Object.values(browser.api.connections).flatMap(( value ) => (value.baseUrl ? [new URL(value.baseUrl)] : []));
    const sockets = reachable.map(( url ) => `${url.protocol === "https:" ? "wss" : "ws"}://${url.hostname}:*`);
    const served = Object.values(config.api.connections).flatMap(( value ) => (value.baseUrl ? [new URL(value.baseUrl).origin] : []));

    return {
        images: [...new Set([...served, ...config.settings.mediaOrigins])],
        frames: [...config.settings.frameOrigins],
        origins: [...new Set([...reachable.map(( url ) => url.origin), ...sockets])].sort(),
    };

}
function owned ( name: string ): boolean {

    return specPaths.some(( path ) => name.startsWith(`${path}/`));

}
function assetHash ( assets: Assets ): string {

    const digest = createHash("sha256");

    for ( const [name, bytes] of assets ) {

        digest.update(JSON.stringify([name, bytes.length]));
        digest.update(bytes);

    }

    return digest.digest("hex").slice(0, 20);

}
function brandImages ( config: CompiledConfig, assets: Assets ): void {

    for ( const path of [config.content.logo, config.content.logo_dark, config.content.icon, config.content.apple_icon] ) {

        if ( path !== null && !assets.has(path.slice(1)) ) {

            throw new Error(`Missing selected brand asset: ${path}`);

        }

    }

}
function writeArtifacts ( folder: string, data: Record<string, unknown> ): void {

    for ( const [name, value] of Object.entries(data) ) {

        writeJson(`${folder}/${name}.json`, value);

    }

}
function writePublic ( folder: string, identity: string, assets: Assets ): void {

    const shared = [...assetFiles(resolve(root, "public"), true)].filter(( [name] ) => !owned(name));
    const files = new Map([...shared, ...assets]);

    for ( const [name, bytes] of files ) {

        writeFile(`${folder}/public/${name}`, bytes);

    }

    writeJson(`${folder}/release.json`, { identity, files: [...files].map(( [path, bytes] ) => ({ path, sha256: sha256(bytes) })) });

}
function writeDevelopment ( assetRoot: string, assets: Assets ): void {

    for ( const [name, bytes] of assets ) {

        writeFile(`public${assetRoot}/${name}`, bytes);

    }

}
function aliases ( folder: string, names: string[] ): Record<string, string> {

    const prefix = `./${relative(root, resolve(root, folder)).replaceAll("\\", "/")}`;

    return {
        ...Object.fromEntries(names.map(( name ) => [`@spec/${name}`, `${prefix}/${name}.json`])),
        "@spec/theme.css": `${prefix}/theme.css`,
        "@spec/registry": `${prefix}/registry.js`,
    };

}
function registry ( folder: string, features: readonly string[] ): string {

    const lines = features.map(( name ) => {

        const entry = relative(resolve(root, folder), resolve(root, "src", "features", name, "index.tsx")).replaceAll("\\", "/");

        return `    ${JSON.stringify(name)}: () => import(${JSON.stringify(entry)}),`;

    });

    return `export default {\n${lines.join("\n")}\n};\n`;

}
export function assemble ( spec: Spec, assets: ReadonlyMap<string, Buffer>, mode: Mode ) {

    const config = forMode(resolveTheme(spec.config), mode);
    const browser = browserConfig(config.api, config.contract);

    brandImages(config, assets);

    return {
        assetRoot: `/_generated/${mode}/${assetHash(assets)}`,
        css: themeCss(config, assets),
        data: {
            config: { ...config, contract: packContract(config.contract) },
            schema: spec.schema,
            messages: spec.messages,
            connections: origins(config, browser),
            routing: { locales: config.settings.locale.enabled, defaultLocale: config.settings.locale.default },
            browser: {
                ...browser,
                contract: packContract(browser.contract),
                routes: spec.schema.screens.flatMap(( screen ) => entityRoute(screen) ?? []),
            },
        },
    };

}
export async function compileSpec ( mode: Mode ) {

    const spec = await loadSpec(specFromEnvironment());
    const assets = composeAssets(resolve(root, "public"), resolve(spec.folder, "brand"));
    const folder = `node_modules/.cache/spec/${mode}`;
    const { assetRoot, css, data } = assemble(spec, assets, mode);

    writeArtifacts(folder, data);
    writeFile(`${folder}/registry.js`, registry(folder, spec.schema.features));
    writeFile(`${folder}/theme.css`, css);
    writePublic(folder, spec.identity, assets);

    if ( mode === "development" ) writeDevelopment(assetRoot, assets);

    const { screens, features } = spec.schema;
    const languages = Object.keys(spec.messages).length;
    const summary = `${screens.length} screen(s), ${features.length} feature(s), ${languages} languages, ${assets.size} spec assets`;

    report(`Compiled ${spec.identity}: ${summary}.`);

    return { identity: spec.identity, assetRoot, paths: specPaths, aliases: aliases(folder, Object.keys(data)) };

}
