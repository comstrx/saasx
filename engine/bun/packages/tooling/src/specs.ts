import { existsSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import type { Catalogue } from "engine/spec";
import { specName } from "engine/validate";
import { directories, entries, failure, guard } from "./core.ts";
import { type Features, featureFacts } from "./features.ts";
import { composeMessages, type Dictionaries } from "./messages.ts";

export type Validate<C, L extends string> = (
    identity: string,
    config: unknown,
    schema: unknown,
    messages: Dictionaries<L>,
    features: Features,
    catalogue: Catalogue,
) => C;
export type LoaderOptions<C, L extends string> = {
    root: string;
    variable: string;
    locales: readonly L[];
    brandFolders: readonly string[];
    catalogue: Catalogue;
    validate: Validate<C, L>;
};
export type Loaded<C, L extends string> = C & { messages: Dictionaries<L>; identity: string; folder: string };
export type Loader<C, L extends string> = {
    installedSpecs: ( directory?: string ) => string[];
    selectSpec: ( value?: string, directory?: string ) => string;
    specFromEnvironment: () => string;
    loadSpec: ( identity: string, directory?: string ) => Promise<Loaded<C, L>>;
};

function entry ( folder: string, part: string, directory: string ): string {

    const path = resolve(folder, part, "index.ts");

    if ( !existsSync(path) ) throw new Error(`${folder}/${part} must have an index.ts entry.`);

    return guard(directory, path, "Spec path escapes specs");

}
async function definition ( folder: string, part: string, directory: string ): Promise<unknown> {

    return ((await import(pathToFileURL(entry(folder, part, directory)).href)) as { default: unknown }).default;

}
function brandIssues ( folder: string, brandFolders: readonly string[] ): void {

    const path = resolve(folder, "brand");
    const unknown = (existsSync(path) ? entries(path) : [])
        .filter(( item ) => !item.name.startsWith(".") && !(item.isDirectory() && brandFolders.includes(item.name)))
        .map(( item ) => item.name);

    if ( unknown.length ) throw new Error(`brand/ holds only ${brandFolders.join(", ")}; found ${unknown.join(", ")}.`);

}
export function createLoader<C, L extends string> ( options: LoaderOptions<C, L> ): Loader<C, L> {

    const { root, variable, locales, brandFolders, catalogue, validate } = options;
    const specs = resolve(root, "specs");
    const features = resolve(root, "src", "features");
    const messages = resolve(root, "messages");
    const installedSpecs = ( directory = specs ): string[] =>
        directories(directory).filter(( folder ) =>
            ["config", "schema"].some(( part ) => existsSync(resolve(directory, folder, part))),
        );
    const selectSpec = ( value = "", directory = specs ): string => {

        const asked = value.trim();
        const installed = installedSpecs(directory);
        const chosen = asked || installed[0];

        if ( asked && !specName.safeParse(asked).success ) throw new Error(`${variable} must use lowercase letters, numbers and hyphens, after an optional leading underscore.`);

        if ( !chosen || !installed.includes(chosen) ) {

            throw new Error(
                `Unknown or missing spec "${chosen ?? ""}" in ${directory}. Installed: ${installed.join(", ") || "(none)"}.`,
            );

        }

        return chosen;

    };
    const load = async ( identity: string, folder: string, directory: string ): Promise<Loaded<C, L>> => {

        const [config, schema, facts] = await Promise.all([
            definition(folder, "config", directory),
            definition(folder, "schema", directory),
            featureFacts(features),
        ]);

        brandIssues(folder, brandFolders);

        const dictionaries = composeMessages({ core: messages, brand: resolve(folder, "brand/messages"), locales });

        return {
            ...validate(identity, config, schema, dictionaries, facts, catalogue),
            messages: dictionaries,
            identity,
            folder,
        };

    };

    return {
        installedSpecs,
        selectSpec,
        specFromEnvironment: () => {

            const mode = process.env.NODE_ENV ?? "development";
            const candidates = [
                `.env.${mode}.local`,
                ...(mode === "test" ? [] : [".env.local"]),
                `.env.${mode}`,
                ".env",
            ];

            for ( const candidate of candidates.map(( file ) => resolve(root, file)) ) {

                if ( existsSync(candidate) ) process.loadEnvFile(candidate);

            }

            return selectSpec(process.env[variable]);

        },
        loadSpec: async ( identity, directory = specs ) => {

            try {

                return await load(selectSpec(identity, directory), resolve(directory, identity), directory);

            } catch ( error ) {

                throw new Error(`Invalid spec ${identity}: ${failure(error)}`);

            }

        },
    };

}
