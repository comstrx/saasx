import { generatedPath } from "engine/base";
import { type Catalog, catalog } from "engine/string";
import groupRows from "../data/emoji-groups.json" with { type: "json" };
import rows from "../data/emojis.json" with { type: "json" };
import { type FlagPlace, flagCode, flagOf } from "./flag.ts";

export type EmojiGroup = { key: string; name: { en: string; ar: string } };
export type Emoji = {
    glyph: string;
    code: string;
    group: string;
    name: { en: string; ar: string };
    keywords: { en: readonly string[]; ar: readonly string[] };
};
export type EmojiOptions = { folder?: string | undefined; flags?: FlagPlace | undefined };
export type Browse = { query?: string | undefined; group?: string | undefined; limit?: number | undefined };
export type Emojis = Catalog<Emoji> & {
    groups: readonly EmojiGroup[];
    files: readonly string[];
    of: ( group: string ) => Emoji[];
    browse: ( browse: Browse ) => Emoji[];
    imageOf: ( glyph: string ) => string | undefined;
};

const selector = /️/g;

export const emojiFolder = `${generatedPath}/world/emoji`;
export const everyEmoji = rows as Emoji[];
export const emojiGroups = groupRows as EmojiGroup[];

export function plainEmoji ( glyph: string ): string {

    return glyph.replace(selector, "");

}
export function emojiCode ( glyph: string ): string {

    return [...plainEmoji(glyph)].map(( char ) => (char.codePointAt(0) ?? 0).toString(16)).join("-");

}
export function defineEmoji ({ folder = emojiFolder, flags }: EmojiOptions = {}): Emojis {

    const fields = ( emoji: Emoji ): string[] => [emoji.glyph, emoji.name.en, emoji.name.ar, ...emoji.keywords.en, ...emoji.keywords.ar];
    const found = catalog(everyEmoji, ( emoji ) => plainEmoji(emoji.glyph), fields);
    const get = ( glyph: string ): Emoji | undefined => found.get(plainEmoji(glyph));
    const of = ( group: string ): Emoji[] => everyEmoji.filter(( emoji ) => emoji.group === group);

    return {
        ...found,
        get,
        has: ( glyph ) => get(glyph) !== undefined,
        groups: emojiGroups,
        files: everyEmoji.filter(( emoji ) => !flagCode(emoji.glyph)).map(( emoji ) => `${emoji.code}.webp`),
        of,
        browse: ({ query, group, limit = 400 }) => {

            const typed = query?.trim() ?? "";

            if ( !typed ) return group ? of(group).slice(0, limit) : everyEmoji.slice(0, limit);

            return found.search(typed, everyEmoji.length).filter(( emoji ) => !group || emoji.group === group).slice(0, limit);

        },
        imageOf: ( glyph ) => {

            const emoji = get(glyph);
            const code = emoji ? flagCode(emoji.glyph) : undefined;

            if ( !emoji ) return undefined;

            return code ? flagOf(code, flags) : `${folder}/${emoji.code}.webp`;

        },
    };

}

export const emojis: Emojis = defineEmoji();
