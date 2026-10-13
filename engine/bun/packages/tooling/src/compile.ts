import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { relative, resolve } from "node:path";
import process from "node:process";
import { mapValues } from "@engine/base";

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

export type AssetSet = { from: string; to: string; files: readonly string[] };

export function syncEngineAssets ( root: string, sets: readonly AssetSet[] ): number {

    let copied = 0;

    for ( const set of sets ) {

        const target = resolve(root, "public", set.to);

        mkdirSync(target, { recursive: true });

        for ( const name of set.files ) {

            const source = resolve(engineAssets, set.from, name);

            if ( !existsSync(source) ) throw new Error(`Missing engine asset: ${set.from}/${name}`);

            copyFileSync(source, resolve(target, name));
            copied += 1;

        }

    }

    return copied;

}
export function flagsModule ( root: string, folder: string, codes: readonly string[], format: string ): string {

    const lines = codes.map(( code ) => {

        const file = resolve(engineAssets, "flag", `${code.toLowerCase()}.${format}`);

        if ( !existsSync(file) ) throw new Error(`Missing engine flag: ${code}`);

        const entry = relative(resolve(root, folder), file).replaceAll("\\", "/");

        return `    ${JSON.stringify(code.toLowerCase())}: require(${JSON.stringify(entry)}),`;

    });

    return `export default {\n${lines.join("\n")}\n};\n`;

}
