import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { dictionary, type Messages, mergeMessages, messageAt, messageKeys } from "engine/translate";
import { failure } from "./core.ts";

export type Dictionaries<L extends string = string> = Record<L, Messages>;
export type MessageSources<L extends string> = { core: string; brand?: string | undefined; locales: readonly L[] };

function read ( path: string ): Messages {

    try {

        return dictionary(JSON.parse(readFileSync(path, "utf8")), path);

    } catch ( error ) {

        throw new Error(`${path}: ${failure(error)}`);

    }

}
function registered ( folder: string, locales: readonly string[] ): void {

    if ( !existsSync(folder) ) return;

    for ( const file of readdirSync(folder).filter(( name ) => name.endsWith(".json")) ) {

        if ( !locales.some(( locale ) => file === `${locale}.json`) ) {

            throw new Error(`${folder}/${file}: register this language before adding its dictionary.`);

        }

    }

}
function mismatch<L extends string> ( dictionaries: Dictionaries<L>, locales: readonly L[] ): L | undefined {

    const [first, ...rest] = locales.map(( locale ) => [locale, messageKeys(dictionaries[locale]).join("\n")] as const);

    return rest.find(( [, keys] ) => keys !== first?.[1])?.[0];

}
function compose ( locale: string, core: string, brand: string | undefined ): Messages {

    const base = read(resolve(core, `${locale}.json`));
    const override = brand ? resolve(brand, `${locale}.json`) : undefined;

    return override && existsSync(override) ? mergeMessages(base, read(override), override) : base;

}
export function composeMessages<L extends string> ({ core, brand, locales }: MessageSources<L>): Dictionaries<L> {

    registered(core, locales);

    if ( brand ) registered(brand, locales);

    const shared = Object.fromEntries(
        locales.map(( locale ) => [locale, read(resolve(core, `${locale}.json`))]),
    ) as Dictionaries<L>;
    const odd = mismatch(shared, locales);

    if ( odd ) throw new Error(`${odd}: shared message keys do not match the other languages.`);

    const result = Object.fromEntries(
        locales.map(( locale ) => [locale, compose(locale, core, brand)]),
    ) as Dictionaries<L>;
    const composed = mismatch(result, locales);

    if ( composed )
        throw new Error(`${brand ?? core}/${composed}.json: composed message keys must match every language.`);

    return result;

}
export type MessageContracts = { reasons: readonly string[]; rules: readonly string[] };

export function messageIssues ( dictionaries: Dictionaries, contracts: MessageContracts ): string[] {

    return Object.entries(dictionaries).flatMap(( [locale, messages] ) => [
        ...contracts.reasons.flatMap(( reason ) =>
            messageAt(messages, `errors.reasons.${reason}`) === undefined
                ? [`${locale}: missing errors.reasons.${reason}`]
                : [],
        ),
        ...contracts.rules.flatMap(( rule ) =>
            messageAt(messages, `errors.rules.${rule}`) === undefined
                ? [`${locale}: missing errors.rules.${rule}`]
                : [],
        ),
    ]);

}
