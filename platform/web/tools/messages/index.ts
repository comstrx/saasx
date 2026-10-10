import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { type Locale, supportedLocales } from "../../src/lib/spec/languages.ts";
import { dictionary, type Messages, mergeMessages, messageKeys } from "../../src/lib/std/messages.ts";
import { failure, report, root, task } from "../core/index.ts";

type Dictionaries = Record<Locale, Messages>;

const core = resolve(root, "messages");

function read ( path: string ): Messages {

    try { return dictionary(JSON.parse(readFileSync(path, "utf8")), path); }
    catch ( error ) { throw new Error(`${path}: ${failure(error)}`); }

}
function registered ( folder: string ): void {

    if ( !existsSync(folder) ) return;

    for ( const file of readdirSync(folder).filter(( name ) => name.endsWith(".json")) ) {

        if ( !supportedLocales.some(( locale ) => file === `${locale}.json`) ) {

            throw new Error(`${folder}/${file}: register this language before adding its dictionary.`);

        }

    }

}
function mismatch ( dictionaries: Dictionaries ): Locale | undefined {

    const [first, ...rest] = supportedLocales.map(( locale ) => [locale, messageKeys(dictionaries[locale]).join("\n")] as const);

    return rest.find(( [, keys] ) => keys !== first?.[1])?.[0];

}
function compose ( locale: Locale, brand: string | undefined ): Messages {

    const base = read(resolve(core, `${locale}.json`));
    const override = brand ? resolve(brand, `${locale}.json`) : undefined;

    return override && existsSync(override) ? mergeMessages(base, read(override), override) : base;

}
function load ( folder: string ): Dictionaries {

    return Object.fromEntries(supportedLocales.map(( locale ) => [locale, read(resolve(folder, `${locale}.json`))])) as Dictionaries;

}
export function composeMessages ( brand?: string ): Dictionaries {

    registered(core);

    if ( brand ) registered(brand);

    const shared = mismatch(load(core));

    if ( shared ) throw new Error(`${shared}: shared message keys do not match the other languages.`);

    const result = Object.fromEntries(supportedLocales.map(( locale ) => [locale, compose(locale, brand)])) as Dictionaries;
    const composed = mismatch(result);

    if ( composed ) {

        const hint = "composed message keys must match every language; translate every new key in each brand dictionary";

        throw new Error(`${brand ?? core}/${composed}.json: ${hint}.`);

    }

    return result;

}

task(import.meta.url, () => {

    composeMessages();
    report("Messages: every shared language has the same complete key set.");

});
