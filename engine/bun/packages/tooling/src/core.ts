import { createHash } from "node:crypto";
import {
    type Dirent,
    existsSync,
    lstatSync,
    mkdirSync,
    readdirSync,
    realpathSync,
    writeFileSync,
} from "node:fs";
import { dirname, resolve, sep } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

export type Found = { entry: Dirent; path: string; name: string };
export type Prune = ( entry: Dirent, name: string ) => boolean;
export type Core = {
    root: string;
    writeFile: ( path: string, content: string | Uint8Array ) => void;
    writeJson: ( path: string, value: unknown ) => void;
};

const never: Prune = () => false;

function ancestor ( path: string ): string {

    let current = path;

    while ( !existsSync(current) ) current = dirname(current);

    return realpathSync(current);

}
export function within ( base: string, path: string ): boolean {

    const target = resolve(path);

    return target.startsWith(resolve(base) + sep) && `${ancestor(target)}${sep}`.startsWith(realpathSync(base) + sep);

}
export function guard ( base: string, path: string, reason: string ): string {

    if ( !within(base, path) ) throw new Error(`${reason}: ${path}`);

    return resolve(path);

}
export function compare ( a: string, b: string ): number {

    return a < b ? -1 : a > b ? 1 : 0;

}
export function entries ( folder: string ): Dirent[] {

    if ( lstatSync(folder).isSymbolicLink() ) throw new Error(`Directory symlinks are not supported: ${folder}`);

    return readdirSync(folder, { withFileTypes: true }).sort(( a, b ) => compare(a.name, b.name));

}
export function walk ( directory: string, prune: Prune = never, prefix = "" ): Found[] {

    const found: Found[] = [];

    for ( const entry of entries(directory) ) {

        const path = resolve(directory, entry.name);
        const name = prefix + entry.name;

        if ( prune(entry, name) ) continue;

        if ( entry.isDirectory() ) found.push(...walk(path, prune, `${name}/`));
        else found.push({ entry, path, name });

    }

    return found;

}
export function directories ( folder: string ): string[] {

    if ( !existsSync(folder) ) return [];

    return entries(folder)
        .filter(( entry ) => entry.isDirectory() && !entry.name.startsWith("."))
        .map(( entry ) => entry.name);

}
export function sha256 ( bytes: Uint8Array | string ): string {

    return createHash("sha256").update(bytes).digest("hex");

}
export function tally ( schema: { screens: readonly unknown[]; features: readonly unknown[]; operations: readonly unknown[] } ): string {

    return `${schema.screens.length} screen(s), ${schema.features.length} feature(s), ${schema.operations.length} operation(s)`;

}
export function failure ( error: unknown ): string {

    return error instanceof Error ? error.message : String(error);

}
export function report ( line: string ): void {

    process.stdout.write(`${line}\n`);

}
export function task ( url: string, run: () => void | Promise<void> ): void {

    if ( process.argv[1] !== fileURLToPath(url) ) return;

    Promise.resolve()
        .then(run)
        .catch(( error: unknown ) => {

            process.stderr.write(`${failure(error)}\n`);
            process.exitCode = 1;

        });

}
export function createCore ( root: URL | string ): Core {

    const base = resolve(typeof root === "string" ? root : fileURLToPath(root));
    const writeFile = ( path: string, content: string | Uint8Array ): void => {

        const target = resolve(base, path);

        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, content);

    };

    return {
        root: base,
        writeFile,
        writeJson: ( path, value ) => writeFile(path, `${JSON.stringify(value, null, 2)}\n`),
    };

}
