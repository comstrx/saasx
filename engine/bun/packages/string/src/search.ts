import { unique } from "engine/array";

const marks = /[̀-ًͯ-ٰٕـ]/g;
const directions = /[‎‏؜‪-‮⁦-⁩]/g;
const easternDigits = /[٠-٩۰-۹]/g;
const variants = /[ةىیکٱ]/g;
const spaces = /\s+/g;
const separators = /[^\p{L}\p{N}+]+/u;
const notDigit = /\D/g;
const article = "ال";
const plain: Readonly<Record<string, string>> = { "ة": "ه", "ى": "ي", "ی": "ي", "ک": "ك", "ٱ": "ا" };

export type Catalog<T> = {
    readonly all: readonly T[];
    get: ( code: string ) => T | undefined;
    has: ( code: string ) => boolean;
    search: ( query: string, limit?: number ) => T[];
};
type Entry<T> = { item: T; fields: string[]; words: string[]; weight: number };

export function fold ( text: string ): string {

    return text
        .normalize("NFKD")
        .replace(marks, "")
        .replace(directions, "")
        .replace(easternDigits, ( digit ) => String(digit.charCodeAt(0) & 0xf))
        .replace(variants, ( letter ) => plain[letter] ?? letter)
        .toLowerCase()
        .replace(spaces, " ")
        .trim();

}
export function digits ( text: string ): string {

    return fold(text).replace(notDigit, "");

}
function bare ( word: string ): string {

    return word.startsWith(article) && word.length > article.length + 1 ? word.slice(article.length) : word;

}
function index<T> ( item: T, fields: readonly string[], weight: number ): Entry<T> {

    const folded = fields.map(fold).filter(Boolean);
    const words = folded.flatMap(( field ) => field.split(separators)).filter(Boolean);

    return { item, fields: unique([...folded, ...folded.map(bare)]), words: unique([...words, ...words.map(bare)]), weight };

}
function score ( query: string, tokens: readonly string[], entry: { fields: readonly string[]; words: readonly string[] } ): number {

    if ( entry.fields.includes(query) ) return 0;
    if ( entry.fields.some(( field ) => field.startsWith(query)) ) return 1;
    if ( tokens.every(( token ) => entry.words.some(( word ) => word.startsWith(token))) ) return 2;
    if ( query.length > 1 && entry.fields.some(( field ) => field.includes(query)) ) return 3;

    return -1;

}
export function rank ( query: string, fields: readonly string[] ): number {

    const needle = fold(query);

    return needle ? score(needle, needle.split(" ").map(bare), index(null, fields, 0)) : -1;

}
export function catalog<T> (
    items: readonly T[],
    codeOf: ( item: T ) => string,
    fieldsOf: ( item: T ) => readonly string[],
    weightOf: ( item: T ) => number = () => 0,
): Catalog<T> {

    const byCode = new Map(items.map(( item ) => [codeOf(item).toLowerCase(), item]));
    let entries: Entry<T>[] | undefined;

    return {
        all: items,
        get: ( code ) => byCode.get(code.toLowerCase()),
        has: ( code ) => byCode.has(code.toLowerCase()),
        search: ( query, limit = 20 ) => {

            const needle = fold(query);

            if ( !needle ) return [];

            const tokens = needle.split(" ").map(bare);

            entries ??= items.map(( item ) => index(item, fieldsOf(item), weightOf(item)));

            return entries
                .map(( entry, at ) => ({ entry, at, rank: score(needle, tokens, entry) }))
                .filter(( found ) => found.rank >= 0)
                .sort(( a, b ) => a.rank - b.rank || b.entry.weight - a.entry.weight || a.at - b.at)
                .slice(0, limit)
                .map(( found ) => found.entry.item);

        },
    };

}
