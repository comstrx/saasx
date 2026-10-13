import { isRecord, kindOf, mapValues } from "@engine/base";
import { isSpecKey } from "./fields.ts";
import type { Manifest, Options } from "./shapes.ts";

export type Features = Readonly<Record<string, Manifest>>;

const readStates = ["loading", "failed", "offline", "cached"] as const;
const listStates = ["empty"] as const;
const writeStates = ["failed", "errors"] as const;

export function stateNames ( manifest: Manifest ): string[] {

    if ( manifest.owner !== "client" ) return [];

    const ports = Object.values(manifest.ports);
    const reads = ports.some(( port ) => port.kind !== "write");
    const lists = ports.some(( port ) => port.kind === "list");
    const writes = ports.some(( port ) => port.kind === "write");

    return [...new Set([...(reads ? readStates : []), ...(lists ? listStates : []), ...(writes ? writeStates : [])])];

}
export function stateIssues ( features: Features ): string[] {

    return Object.entries(features).flatMap(( [name, manifest] ) => {

        const missing = stateNames(manifest).filter(( state ) =>
            state === "errors" ? !isRecord(manifest.options[state]) : typeof manifest.options[state] !== "string",
        );

        if ( !missing.length ) return [];

        const reads = missing.some(( state ) => state !== "failed" && state !== "errors");

        return reads
            ? [
                  `features/${name}: a feature that reads names its loading, failed, offline and cached texts in its options; one that lists also names empty.`,
              ]
            : [`features/${name}: a feature that writes names its failed text and an errors map in its options.`];

    });

}

function kind ( value: unknown ): string {

    return isSpecKey(value) ? "string" : kindOf(value);

}
export function optionIssues ( given: Options, defaults: Options, feature: string, where: string ): string[] {

    return Object.entries(given).flatMap(( [name, value] ) => {

        if ( !Object.hasOwn(defaults, name) ) return [`${where}: feature ${feature} has no option ${name}.`];

        const expected = kind(defaults[name]);
        const fallback = defaults[name];

        if ( expected === "object" && isSpecKey(value) ) return [];

        if ( expected !== kind(value) ) {

            return [`${where}: option ${name} of ${feature} takes ${expected}, not ${kind(value)}.`];

        }

        return isRecord(value) && isRecord(fallback) ? optionIssues(value, fallback, feature, `${where}.${name}`) : [];

    });

}
export function mergeOptions ( defaults: Options, given: Options ): Options {

    return {
        ...defaults,
        ...mapValues(given, ( value, name ) => {

            const fallback = defaults[name];

            return isRecord(fallback) && isRecord(value) ? mergeOptions(fallback, value) : value;

        }),
    };

}
