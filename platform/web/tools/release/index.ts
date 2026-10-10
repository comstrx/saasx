import { cpSync, existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { readJson, remove, report, root, sha256, task, walk, within, writeFile, writeJson } from "../core/index.ts";
import { loadSpec, specFromEnvironment } from "../specs/index.ts";

type Manifest = { identity: string; files: { path: string; sha256: string }[] };
type Package = { name: string; version: string; type: string; engines: { node: string } };

const output = resolve(root, ".next/standalone");
const snapshot = resolve(root, "node_modules/.cache/spec/production");
const leaks = ["specs", "src", "tools", "messages", ".generated", "public/_generated", ".next/cache"];
const kept = ["server.js", "package.json", "node_modules", ".next"];

function checkBuild ( manifest: Manifest ): void {

    const built = readJson<{ config: { env?: Record<string, string> } }>(resolve(root, ".next/required-server-files.json"));

    if ( built.config.env?.NEXT_PUBLIC_SPEC !== manifest.identity ) {

        throw new Error("Compiled identity and asset snapshot disagree; rebuild without concurrent compilation.");

    }
    if ( !existsSync(resolve(output, "server.js")) || !within(root, output) ) {

        throw new Error("Missing standalone build; run pnpm build.");

    }

}
function checkAsset ( path: string ): void {

    if ( path.startsWith("/") || path.split("/").some(( part ) => [".", "..", ""].includes(part)) ) {

        throw new Error(`Invalid release asset: ${path}`);

    }

}
function checkLeaks (): void {

    const found = leaks.find(( path ) => existsSync(resolve(output, path)));

    if ( found ) throw new Error(`Source/cache leakage in release: ${found}`);

}
export function scan ( folder: string, secrets: readonly string[] ): string | undefined {

    const needles = secrets.filter(( value ) => value.length >= 8);

    for ( const { path } of walk(folder) ) {

        const text = readFileSync(path, "latin1");
        const found = needles.find(( needle ) => text.includes(needle));

        if ( found ) return `${path} carries ${found.slice(0, 4)}…`;

    }

    return undefined;

}
async function checkSecrets (): Promise<void> {

    const { config } = await loadSpec(specFromEnvironment());
    const keys = (process.env.FRONT_KEYS ?? "").split(/[\s,]+/).flatMap(( entry ) => entry.split(/[=:]/));
    const local = Object.values(config.api.connections).flatMap(( value ) => value.development?.baseUrl ?? []);
    const secrets = [process.env.FRONT_KEY ?? "", process.env.FRONT_SECRET ?? "", ...keys, ...local.filter(( url ) => !Object.values(config.api.connections).some(( value ) => value.baseUrl === url))];
    const leaked = scan(resolve(output, ".next"), secrets);

    if ( leaked ) throw new Error(`Secret leakage in release: ${leaked}`);

}
function prune (): void {

    for ( const entry of readdirSync(output).filter(( name ) => !kept.includes(name)) ) {

        remove(output, resolve(output, entry));

    }

    remove(output, resolve(output, ".next/cache"));
    remove(output, resolve(output, ".next/static"));

}
function copyStatic (): void {

    cpSync(resolve(root, ".next/static"), resolve(output, ".next/static"), { recursive: true });

}
function copyAssets ( manifest: Manifest ): void {

    for ( const item of manifest.files ) {

        checkAsset(item.path);

        const bytes = readFileSync(resolve(snapshot, "public", item.path));

        if ( sha256(bytes) !== item.sha256 ) throw new Error(`Asset changed during the build: ${item.path}`);

        writeFile(resolve(output, "public", item.path), bytes);

    }

}
function strip (): void {

    for ( const { entry, path } of walk(output) ) {

        if ( entry.name.endsWith(".map") || entry.name.startsWith(".env") ) remove(output, path);

    }

}
function writePackage (): void {

    const source = readJson<Package>(resolve(root, "package.json"));

    writeJson(resolve(output, "package.json"), {
        name: source.name,
        version: source.version,
        private: true,
        type: source.type,
        scripts: { start: "node server.js" },
        engines: { node: source.engines.node },
    });

}
async function release (): Promise<void> {

    const manifest = readJson<Manifest>(resolve(snapshot, "release.json"));

    checkBuild(manifest);
    prune();
    copyStatic();
    copyAssets(manifest);
    strip();
    checkLeaks();
    await checkSecrets();
    writePackage();
    writeJson(resolve(output, "release.json"), { identity: manifest.identity, assets: manifest.files.length });

    report(`Release: ${manifest.identity}, ${manifest.files.length} public assets, source-free standalone at .next/standalone.`);

}

task(import.meta.url, release);
