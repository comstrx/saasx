import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import process from "node:process";
import { generatedPath, isRecord, mapValues } from "@engine/base";
import { type EmojiFiles, emojiFolder, flagFolder } from "@engine/world";
import type { Files } from "./assets.ts";

export type Mode = "development" | "production";
export type Connection = {
    baseUrl: string | null;
    development?: { baseUrl: string | null; browserBaseUrl: string | null } | undefined;
};
export type Routing = { locales: string[]; defaultLocale: string };

export function modeOf ( asked: string | undefined ): Mode {

    if ( asked === "development" || asked === "production" ) return asked;

    return process.env.NODE_ENV === "production" ? "production" : "development";

}
export function selectConnection<T extends Connection> ( value: T, mode: Mode ): T {

    const { development, ...connection } = value;

    return { ...connection, ...(mode === "development" ? development : {}) } as T;

}
export function selectConnections<T extends Connection> (
    connections: Readonly<Record<string, T>>,
    mode: Mode,
): Record<string, T> {

    return mapValues(connections, ( value ) => selectConnection(value, mode));

}
export function routingOf ( settings: { locale: { enabled: string[]; default: string } } ): Routing {

    return { locales: settings.locale.enabled, defaultLocale: settings.locale.default };

}
export function assetHash ( assets: ReadonlyMap<string, Uint8Array> ): string {

    const digest = createHash("sha256");

    for ( const [name, bytes] of assets ) {

        digest.update(JSON.stringify([name, bytes.length]));
        digest.update(bytes);

    }

    return digest.digest("hex").slice(0, 20);

}
export function brandImages ( paths: readonly (string | null)[], assets: ReadonlyMap<string, Uint8Array> ): void {

    for ( const path of paths ) {

        if ( path !== null && !assets.has(path.slice(1)) ) throw new Error(`Missing selected brand asset: ${path}`);

    }

}
export function specAliases (
    root: string,
    folder: string,
    names: readonly string[],
    extra: Readonly<Record<string, string>> = {},
): Record<string, string> {

    const prefix = `./${relative(root, resolve(root, folder)).replaceAll("\\", "/")}`;

    return {
        ...Object.fromEntries(names.map(( name ) => [`@spec/${name}`, `${prefix}/${name}.json`])),
        ...mapValues(extra, ( file ) => `${prefix}/${file}`),
        "@spec/registry": `${prefix}/registry.js`,
    };

}
export function registryModule ( root: string, folder: string, features: readonly string[] ): string {

    const lines = features.map(( name ) => {

        const entry = relative(resolve(root, folder), resolve(root, "src", "features", name, "index.tsx")).replaceAll(
            "\\",
            "/",
        );

        return `    ${JSON.stringify(name)}: () => import(${JSON.stringify(entry)}),`;

    });

    return `export default {\n${lines.join("\n")}\n};\n`;

}
export const engineAssets: string = resolve(import.meta.dir, "../../../assets");
export const generatedRoot = `public${generatedPath}`;

export type EngineAssets = { flags?: readonly string[] | undefined; emoji?: EmojiFiles | undefined };

function copyAssets ( root: string, from: string, to: string, files: readonly string[] ): number {

    const target = resolve(root, `public${to}`);
    let copied = 0;

    mkdirSync(target, { recursive: true });

    for ( const name of files ) {

        const source = resolve(engineAssets, from, name);
        const destination = resolve(target, name);

        if ( !existsSync(source) ) throw new Error(`Missing engine asset: ${from}/${name}`);
        if ( existsSync(destination) && statSync(destination).size === statSync(source).size ) continue;

        copyFileSync(source, destination);
        copied += 1;

    }

    return copied;

}
export function syncEngineAssets ( root: string, assets: EngineAssets ): number {

    const flags = (assets.flags ?? []).map(( code ) => `${code.toLowerCase()}.svg`);

    return copyAssets(root, "flag", flagFolder, flags)
        + copyAssets(root, "emoji/static", `${emojiFolder}/static`, assets.emoji?.static ?? [])
        + copyAssets(root, "emoji/motion", `${emojiFolder}/motion`, assets.emoji?.motion ?? []);

}
export function publishedUrls<T> ( value: T, files: ReadonlyMap<string, Uint8Array> ): T {

    if ( typeof value === "string" ) return (value.startsWith("/") && files.has(value.slice(1)) ? `${generatedPath}${value}` : value) as T;
    if ( Array.isArray(value) ) return value.map(( item ) => publishedUrls(item, files)) as T;
    if ( isRecord(value) ) return mapValues(value, ( item ) => publishedUrls(item, files)) as T;

    return value;

}
export function publishAssets ( root: string, folders: readonly string[], files: Files ): void {

    const stranger = [...files.keys()].find(( name ) => !folders.some(( folder ) => name.startsWith(`${folder}/`)));

    if ( stranger ) throw new Error(`Asset outside the published folders: ${stranger}`);

    for ( const folder of folders ) rmSync(resolve(root, generatedRoot, folder), { recursive: true, force: true });

    for ( const [name, bytes] of files ) {

        const path = resolve(root, generatedRoot, name);

        mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, bytes);

    }

}
export type Required = { name: string; from: string; file: string };

export function requireModule ( root: string, folder: string, entries: readonly Required[] ): string {

    const lines = entries.map(( entry ) => {

        const file = resolve(engineAssets, entry.from, entry.file);

        if ( !existsSync(file) ) throw new Error(`Missing engine asset: ${entry.from}/${entry.file}`);

        const path = relative(resolve(root, folder), file).replaceAll("\\", "/");

        return `    ${JSON.stringify(entry.name)}: require(${JSON.stringify(path)}),`;

    });

    return `export default {\n${lines.join("\n")}\n};\n`;

}
export function flagsModule ( root: string, folder: string, codes: readonly string[], format: string ): string {

    return requireModule(root, folder, codes.map(( code ) => ({ name: code.toLowerCase(), from: "flag", file: `${code.toLowerCase()}.${format}` })));

}
export function assetBytes ( entries: readonly Required[] ): number {

    return entries.reduce(( total, entry ) => total + statSync(resolve(engineAssets, entry.from, entry.file)).size, 0);

}
export function assetBudget ( entries: readonly Required[], limit: number, what: string ): number {

    const bytes = assetBytes(entries);

    if ( bytes > limit ) throw new Error(`${what}: ${entries.length} files weigh ${(bytes / 1048576).toFixed(2)} MB, over the ${(limit / 1048576).toFixed(2)} MB budget.`);

    return bytes;

}
