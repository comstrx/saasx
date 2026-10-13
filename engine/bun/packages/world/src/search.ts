const marks = /[̀-ًͯ-ْٰـ]/g;
const alef = /[أإآ]/g;
const notDigit = /\D/g;

export function fold ( text: string ): string {

    return text
        .normalize("NFKD")
        .replace(marks, "")
        .replace(alef, "ا")
        .replaceAll("ة", "ه")
        .replaceAll("ى", "ي")
        .toLowerCase()
        .trim();

}
export function digits ( text: string ): string {

    return text.replace(notDigit, "");

}
export function rank ( query: string, fields: readonly string[] ): number {

    let best = -1;

    for ( const field of fields ) {

        if ( field === query ) return 0;

        if ( field.startsWith(query) ) best = best === -1 ? 1 : Math.min(best, 1);
        else if ( best === -1 && field.includes(query) ) best = 2;

    }

    return best;

}
export type Catalog<T> = {
    readonly all: readonly T[];
    get: ( code: string ) => T | undefined;
    has: ( code: string ) => boolean;
    search: ( query: string, limit?: number ) => T[];
};

export function catalog<T> (
    items: readonly T[],
    codeOf: ( item: T ) => string,
    fieldsOf: ( item: T ) => readonly string[],
    weightOf: ( item: T ) => number = () => 0,
): Catalog<T> {

    const byCode = new Map(items.map(( item ) => [codeOf(item).toLowerCase(), item]));
    const folded = items.map(( item ) => ({ item, fields: fieldsOf(item).map(fold), weight: weightOf(item) }));

    return {
        all: items,
        get: ( code ) => byCode.get(code.toLowerCase()),
        has: ( code ) => byCode.has(code.toLowerCase()),
        search: ( query, limit = 20 ) => {

            const needle = fold(query);

            if ( !needle ) return [];

            return folded
                .map(( entry, index ) => ({ entry, index, score: rank(needle, entry.fields) }))
                .filter(( found ) => found.score >= 0)
                .sort(( a, b ) => a.score - b.score || b.entry.weight - a.entry.weight || a.index - b.index)
                .slice(0, limit)
                .map(( found ) => found.entry.item);

        },
    };

}
