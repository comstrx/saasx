import { catalog, digits } from "engine/string";
import { type Country, dialings, everyCountry } from "./country.ts";

export type Key = { code: string; key: string; areas: readonly string[]; primary: boolean; name: Country["name"] };
export type Keys = {
    readonly all: readonly Key[];
    of: ( country: string ) => string | undefined;
    search: ( query: string, limit?: number ) => Key[];
};

const letters = /\p{L}/u;

function rankOf ( entry: Key, codes: readonly string[], typed: string ): number {

    if ( codes[1] === typed ) return entry.primary ? 0 : 1;
    if ( codes.includes(typed) ) return 0;
    if ( codes.some(( code ) => code.startsWith(typed)) ) return entry.primary ? 2 : 3;

    return -1;

}
export function defineKeys ( from: readonly Country[] = everyCountry ): Keys {

    const all: Key[] = from.flatMap(({ code, key, areas, primary, name }) => (key ? [{ code, key, areas, primary, name }] : []));
    const byCode = new Map(all.map(( entry ) => [entry.code, entry.key]));
    const byName = catalog(all, ( entry ) => entry.code, ( entry ) => [entry.code, entry.name.en, entry.name.ar, entry.name.native]);
    const numbers = all.map(( entry, at ) => ({ entry, at, codes: dialings(entry.key, entry.areas).map(digits) }));

    return {
        all,
        of: ( country ) => byCode.get(country.toUpperCase()),
        search: ( query, limit = 20 ) => {

            if ( letters.test(query) ) return byName.search(query, limit);

            const typed = digits(query).replace(/^00/, "");

            if ( !typed ) return [];

            return numbers
                .map(( found ) => ({ ...found, rank: rankOf(found.entry, found.codes, typed) }))
                .filter(( found ) => found.rank >= 0)
                .sort(( a, b ) => a.rank - b.rank || a.at - b.at)
                .slice(0, limit)
                .map(( found ) => found.entry);

        },
    };

}

export const keys: Keys = defineKeys();
