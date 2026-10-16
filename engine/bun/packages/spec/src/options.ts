import { unique } from "engine/array";
import { isRecord, kindOf } from "engine/base";
import { isMessageKey } from "engine/translate";
import type { Manifest, Options } from "./shapes.ts";

export type Features = Readonly<Record<string, Manifest>>;

const readStates = ["loading", "failed", "offline", "cached"] as const;
const listStates = ["empty"] as const;
const writeStates = ["failed", "errors"] as const;
const readerRule = [
    "a feature that reads names its loading, failed, offline and cached texts in its options;",
    "one that lists also names empty.",
].join(" ");
const writerRule = "a feature that writes names its failed text and an errors map in its options.";

export function stateNames ( manifest: Manifest ): string[] {

    if ( manifest.owner !== "client" ) return [];

    const ports = Object.values(manifest.ports);
    const reads = ports.some(( port ) => port.kind !== "write");
    const lists = ports.some(( port ) => port.kind === "list");
    const writes = ports.some(( port ) => port.kind === "write");

    return unique([...(reads ? readStates : []), ...(lists ? listStates : []), ...(writes ? writeStates : [])]);

}
export function stateTexts ( manifest: Manifest, given: Options ): Options {

    const missing = stateNames(manifest).filter(( state ) => given[state] === undefined);

    return Object.fromEntries(missing.map(( state ) => [state, { key: state === "errors" ? "errors" : `state.${state}` }]));

}
export function stateIssues ( features: Features ): string[] {

    return Object.entries(features).flatMap(( [name, manifest] ) => {

        const missing = stateNames(manifest).filter(( state ) =>
            state === "errors" ? !isRecord(manifest.options[state]) : typeof manifest.options[state] !== "string",
        );

        if ( !missing.length ) return [];

        const reads = missing.some(( state ) => state !== "failed" && state !== "errors");

        return [`features/${name}: ${reads ? readerRule : writerRule}`];

    });

}
function kind ( value: unknown ): string {

    return isMessageKey(value) ? "string" : kindOf(value);

}
export function optionIssues ( given: Options, defaults: Options, feature: string, where: string ): string[] {

    return Object.entries(given).flatMap(( [name, value] ) => {

        if ( !Object.hasOwn(defaults, name) ) return [`${where}: feature ${feature} has no option ${name}.`];

        const expected = kind(defaults[name]);
        const fallback = defaults[name];

        if ( expected === "object" && isMessageKey(value) ) return [];

        if ( expected !== kind(value) ) {

            return [`${where}: option ${name} of ${feature} takes ${expected}, not ${kind(value)}.`];

        }

        return isRecord(value) && isRecord(fallback) ? optionIssues(value, fallback, feature, `${where}.${name}`) : [];

    });

}
