import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { dictionary, type Messages, mergeMessages, messageKeys } from "@engine/translate";
import { failure } from "./core.ts";

export type Dictionaries<L extends string = string> = Record<L, Messages>;
export type MessageSources<L extends string> = { core: string; brand?: string | undefined; locales: readonly L[] };

function read(path: string): Messages {
    try {
        return dictionary(JSON.parse(readFileSync(path, "utf8")), path);
    } catch (error) {
        throw new Error(`${path}: ${failure(error)}`);
    }
}
function registered(folder: string, locales: readonly string[]): void {
    if (!existsSync(folder)) return;

    for (const file of readdirSync(folder).filter((name) => name.endsWith(".json"))) {
        if (!locales.some((locale) => file === `${locale}.json`)) {
            throw new Error(`${folder}/${file}: register this language before adding its dictionary.`);
        }
    }
}
function mismatch<L extends string>(dictionaries: Dictionaries<L>, locales: readonly L[]): L | undefined {
    const [first, ...rest] = locales.map((locale) => [locale, messageKeys(dictionaries[locale]).join("\n")] as const);

    return rest.find(([, keys]) => keys !== first?.[1])?.[0];
}
function compose(locale: string, core: string, brand: string | undefined): Messages {
    const base = read(resolve(core, `${locale}.json`));
    const override = brand ? resolve(brand, `${locale}.json`) : undefined;

    return override && existsSync(override) ? mergeMessages(base, read(override), override) : base;
}
/**
 * The dictionaries of every registered language: the core set, patched by a brand's overrides,
 * with the same complete key set in every language or a build failure naming the odd one.
 */
export function composeMessages<L extends string>({ core, brand, locales }: MessageSources<L>): Dictionaries<L> {
    registered(core, locales);

    if (brand) registered(brand, locales);

    const shared = Object.fromEntries(
        locales.map((locale) => [locale, read(resolve(core, `${locale}.json`))]),
    ) as Dictionaries<L>;
    const odd = mismatch(shared, locales);

    if (odd) throw new Error(`${odd}: shared message keys do not match the other languages.`);

    const result = Object.fromEntries(
        locales.map((locale) => [locale, compose(locale, core, brand)]),
    ) as Dictionaries<L>;
    const composed = mismatch(result, locales);

    if (composed)
        throw new Error(`${brand ?? core}/${composed}.json: composed message keys must match every language.`);

    return result;
}
