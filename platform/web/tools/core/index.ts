import { createHash } from "node:crypto";
import { type Dirent, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

type Found = { entry: Dirent; path: string; name: string };
type Prune = ( entry: Dirent, name: string ) => boolean;

export const root = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const never: Prune = () => false;

function ancestor ( path: string ): string {

    let current = path;

    while ( !existsSync(current) ) {

        current = dirname(current);

    }

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
export function walk ( directory: string, prune = never, prefix = "" ): Found[] {

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

    return entries(folder).filter(( entry ) => entry.isDirectory() && !entry.name.startsWith(".")).map(( entry ) => entry.name);

}
export function readJson<T> ( path: string ): T {

    return JSON.parse(readFileSync(path, "utf8")) as T;

}
export function writeFile ( path: string, content: string | Buffer ): void {

    const target = guard(root, resolve(root, path), "Output escapes the app");
    const bytes = Buffer.from(content);

    mkdirSync(dirname(target), { recursive: true });

    if ( !existsSync(target) || !readFileSync(target).equals(bytes) ) writeFileSync(target, bytes);

}
export function writeJson ( path: string, value: unknown ): void {

    writeFile(path, `${JSON.stringify(value, null, 4)}\n`);

}
export function remove ( base: string, path: string ): void {

    rmSync(guard(base, path, "Refusing to remove outside its base"), { recursive: true, force: true });

}
export function sha256 ( bytes: string | Buffer ): string {

    return createHash("sha256").update(bytes).digest("hex");

}
export function failure ( error: unknown ): string {

    return error instanceof Error ? error.message : String(error);

}
export function report ( line: string ): void {

    process.stdout.write(`${line}\n`);

}
export function task ( url: string, run: () => void | Promise<void> ): void {

    if ( process.argv[1] !== fileURLToPath(url) ) return;

    Promise.resolve().then(run).catch(( error: unknown ) => {

        process.stderr.write(`${failure(error)}\n`);
        process.exitCode = 1;

    });

}
