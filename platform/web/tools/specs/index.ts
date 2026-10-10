import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { validateSpec } from "../../src/lib/spec/validate.ts";
import { brandFolders } from "../assets/index.ts";
import { directories, entries, failure, guard, report, root, task } from "../core/index.ts";
import { featureFacts } from "../features/index.ts";
import { composeMessages } from "../messages/index.ts";

export type Spec = Awaited<ReturnType<typeof loadSpec>>;

const specs = resolve(root, "specs");
const name = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function installedSpecs ( directory = specs ): string[] {

    return directories(directory).filter(( folder ) => ["config", "schema"].some(( part ) => existsSync(resolve(directory, folder, part))));

}
export function selectSpec ( value = "", directory = specs ): string {

    const asked = value.trim();
    const installed = installedSpecs(directory);
    const chosen = asked || installed[0];

    if ( asked && !name.test(asked) ) throw new Error("NEXT_PUBLIC_SPEC must use lowercase letters, numbers and hyphens.");
    if ( !chosen || !installed.includes(chosen) ) {

        throw new Error(`Unknown or missing spec "${chosen ?? ""}" in ${directory}. Installed: ${installed.join(", ") || "(none)"}.`);

    }

    return chosen;

}
export function specFromEnvironment (): string {

    const mode = process.env.NODE_ENV ?? "development";
    const candidates = [`.env.${mode}.local`, ...(mode === "test" ? [] : [".env.local"]), `.env.${mode}`, ".env"];

    for ( const candidate of candidates.map(( file ) => resolve(root, file)) ) {

        if ( existsSync(candidate) ) process.loadEnvFile(candidate);

    }

    return selectSpec(process.env.NEXT_PUBLIC_SPEC);

}
function entry ( folder: string, part: string, directory: string ): string {

    const candidates = ["ts", "js"].map(( extension ) => resolve(folder, part, `index.${extension}`)).filter(existsSync);
    const [path] = candidates;

    if ( candidates.length !== 1 || !path ) throw new Error(`${folder}/${part} must have exactly one index.ts or index.js entry.`);

    return guard(directory, path, "Spec path escapes specs");

}
async function definition ( folder: string, part: string, directory: string ): Promise<unknown> {

    return (await import(pathToFileURL(entry(folder, part, directory)).href) as { default: unknown }).default;

}
function brand ( folder: string ): void {

    const path = resolve(folder, "brand");

    const unknown = (existsSync(path) ? entries(path) : [])
        .filter(( item ) => !item.name.startsWith(".") && !(item.isDirectory() && brandFolders.includes(item.name)))
        .map(( item ) => item.name);

    if ( unknown.length ) throw new Error(`brand/ holds only ${brandFolders.join(", ")}; found ${unknown.join(", ")}.`);

}
async function load ( identity: string, folder: string, directory: string ) {

    const [config, schema] = await Promise.all([definition(folder, "config", directory), definition(folder, "schema", directory)]);

    brand(folder);

    const messages = composeMessages(resolve(folder, "brand/messages"));

    return { ...validateSpec(config, schema, messages, featureFacts()), messages, identity, folder };

}
export async function loadSpec ( identity: string, directory = specs ) {

    try { return await load(selectSpec(identity, directory), resolve(directory, identity), directory); }
    catch ( error ) { throw new Error(`Invalid spec ${identity}: ${failure(error)}`); }

}
async function check (): Promise<void> {

    const selected = specFromEnvironment();

    for ( const name of installedSpecs() ) {

        const { screens, features } = (await loadSpec(name)).schema;
        const chosen = name === selected ? " (selected)" : "";

        report(`Spec: ${name} — ${screens.length} screen(s) over ${features.length} feature(s), messages valid${chosen}.`);

    }

}

task(import.meta.url, check);
