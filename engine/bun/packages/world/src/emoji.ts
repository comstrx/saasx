import { generatedPath } from "@engine/base";
import { type Catalog, catalog } from "@engine/string";
import { emojiGroups, emojiMotions, emojiTones, emojiTuples } from "./generated/emoji.ts";
import type { Emoji, EmojiDisplay, EmojiGroup, EmojiMoment, EmojiSprite, EmojiTone } from "./kinds.ts";

export const emojiFolder = `${generatedPath}/images/emoji`;

export type EmojiOptions = {
    folder?: string | undefined;
    format?: string | undefined;
    animated?: readonly string[] | undefined;
};
export type EmojiFiles = { static: string[]; motion: string[] };
export type Emojis = {
    all: readonly Emoji[];
    groups: readonly EmojiGroup[];
    tones: readonly EmojiTone[];
    get: ( glyph: string ) => Emoji | undefined;
    search: ( query: string, limit?: number ) => Emoji[];
    of: ( group: string ) => Emoji[];
    tone: ( glyph: string, tone?: string | undefined ) => string;
    keyOf: ( glyph: string ) => string;
    staticOf: ( glyph: string ) => string | undefined;
    motionOf: ( glyph: string ) => EmojiSprite | undefined;
    display: ( glyph: string, moment: EmojiMoment ) => EmojiDisplay;
    files: ( options?: { tones?: boolean | undefined } ) => EmojiFiles;
};

const selector = /\uFE0F/g;
const hasStatic = 1;
const hasAnimated = 2;
const hasTones = 4;
const light = emojiTones[0]?.modifier ?? "";
const columns = 8;

export function plainEmoji ( glyph: string ): string {

    return glyph.replace(selector, "");

}
export function emojiKey ( glyph: string ): string {

    return [...plainEmoji(glyph)].map(( character ) => (character.codePointAt(0) ?? 0).toString(16)).join("-");

}
function expand (): { all: Emoji[]; toned: Map<string, string> } {

    const toned = new Map<string, string>();
    const all = emojiTuples.map(( [glyph, group, en, ar, enKeys, arKeys, lightGlyph, facts] ): Emoji => {

        if ( lightGlyph ) toned.set(plainEmoji(glyph), lightGlyph);

        return {
            glyph,
            key: emojiKey(glyph),
            group: emojiGroups[group]?.key ?? "",
            name: { en, ar },
            keywords: { en: enKeys, ar: arKeys },
            toned: lightGlyph !== "",
            assets: { static: (facts & hasStatic) !== 0, animated: (facts & hasAnimated) !== 0, tones: (facts & hasTones) !== 0 },
        };

    });

    return { all, toned };

}
function baseOf ( glyph: string ): string {

    return plainEmoji(glyph).replace(/[\u{1F3FB}-\u{1F3FF}]/gu, "");

}
export function defineEmoji ( options: EmojiOptions = {} ): Emojis {

    const folder = options.folder ?? emojiFolder;
    const format = options.format ?? "webp";
    const { all, toned } = expand();
    const chosen = options.animated ? new Set(options.animated.map(plainEmoji)) : null;
    const index: Catalog<Emoji> = catalog(all, ( emoji ) => plainEmoji(emoji.glyph), ( emoji ) => [emoji.glyph, emoji.name.en, emoji.name.ar, ...emoji.keywords.en.split("|"), ...emoji.keywords.ar.split("|")].filter(Boolean));
    const get = ( glyph: string ): Emoji | undefined => index.get(plainEmoji(glyph)) ?? index.get(baseOf(glyph));
    const tone = ( glyph: string, key?: string | undefined ): string => {

        const base = get(glyph);
        const modifier = key ? emojiTones.find(( entry ) => entry.key === key)?.modifier : undefined;
        const lightGlyph = base ? toned.get(plainEmoji(base.glyph)) : undefined;

        if ( !base ) return glyph;
        if ( !modifier || !lightGlyph ) return base.glyph;

        return lightGlyph.replaceAll(light, modifier);

    };
    const isToned = ( glyph: string ): boolean => plainEmoji(glyph) !== baseOf(glyph);
    const staticOf = ( glyph: string ): string | undefined => {

        const base = get(glyph);

        if ( !base?.assets.static || (isToned(glyph) && !base.assets.tones) ) return undefined;

        return `${folder}/static/${emojiKey(glyph)}.${format}`;

    };
    const motionOf = ( glyph: string ): EmojiSprite | undefined => {

        const base = get(glyph);
        const motion = base ? emojiMotions[base.key] : undefined;

        if ( !base || !motion || isToned(glyph) || (chosen && !chosen.has(plainEmoji(base.glyph))) ) return undefined;

        const [frames, ms] = motion;

        return { src: `${folder}/motion/${base.key}.${format}`, frames, columns, rows: Math.ceil(frames / columns), ms };

    };
    const fallback = ( glyph: string ): EmojiDisplay => {

        const still = staticOf(glyph);

        return still ? { kind: "static", src: still, glyph } : { kind: "glyph", glyph };

    };

    return {
        all,
        groups: emojiGroups,
        tones: emojiTones,
        get,
        search: ( query, limit = 40 ) => index.search(query, limit),
        of: ( group ) => all.filter(( emoji ) => emoji.group === group),
        tone,
        keyOf: emojiKey,
        staticOf,
        motionOf,
        display: ( glyph, moment ) => {

            if ( moment.context === "inline" ) return { kind: "glyph", glyph };
            if ( moment.context === "picker" || !moment.active || moment.reducedMotion ) return fallback(glyph);

            const sprite = motionOf(glyph);

            return sprite ? { kind: "animated", sprite, still: staticOf(glyph), glyph } : fallback(glyph);

        },
        files: ( chosenFiles = {} ) => ({
            static: all.flatMap(( emoji ) => {

                if ( !emoji.assets.static ) return [];

                const variants = chosenFiles.tones && emoji.assets.tones ? emojiTones.map(( entry ) => tone(emoji.glyph, entry.key)) : [];

                return [emoji.glyph, ...variants].map(( glyph ) => `${emojiKey(glyph)}.${format}`);

            }),
            motion: all.filter(( emoji ) => motionOf(emoji.glyph) !== undefined).map(( emoji ) => `${emoji.key}.${format}`),
        }),
    };

}
