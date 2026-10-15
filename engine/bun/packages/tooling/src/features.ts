import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { isRecord } from "engine/base";
import { type Manifest, manifestShape } from "engine/spec";
import { failure } from "./core.ts";

export type Features = Record<string, Manifest>;

function literal ( value: unknown, where: string ): void {

    if ( value === null ) throw new Error(`${where}: null defaults are not typed; give a real default.`);

    if ( Array.isArray(value) ) {

        value.forEach(( item, index ) => {

            literal(item, `${where}[${index}]`);

        });

    } else if ( isRecord(value) ) {

        for ( const [key, item] of Object.entries(value) ) literal(item, `${where}.${key}`);

    } else if ( !["string", "number", "boolean"].includes(typeof value) ) {

        throw new Error(`${where}: options are literal values only.`);

    }

}
export function featureNames ( folder: string ): string[] {

    if ( !existsSync(folder) ) return [];

    return readdirSync(folder, { withFileTypes: true })
        .filter(( entry ) => entry.isDirectory())
        .map(( entry ) => entry.name)
        .sort();

}
async function manifestOf ( folder: string, name: string ): Promise<Manifest> {

    const path = resolve(folder, name, "feature.ts");

    if ( !existsSync(path) ) throw new Error(`features/${name}: a feature declares itself in feature.ts.`);

    const loaded = ((await import(pathToFileURL(path).href)) as { default?: unknown }).default;
    const parsed = manifestShape.safeParse(loaded);

    if ( !parsed.success ) {

        const issues = parsed.error.issues.map(( issue ) => `${issue.path.join(".") || "manifest"} ${issue.message}`);

        throw new Error(`features/${name}/feature.ts: ${issues.join("; ")}`);

    }

    literal(parsed.data.options, `features/${name}/feature.ts options`);

    return parsed.data;

}
export async function featureFacts ( folder: string ): Promise<Features> {

    const facts: Features = {};

    for ( const name of featureNames(folder) ) {

        try {

            facts[name] = await manifestOf(folder, name);

        } catch ( error ) {

            throw new Error(failure(error));

        }

    }

    return facts;

}
