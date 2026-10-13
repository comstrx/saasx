import { type Catalog, catalog } from "@engine/string";
import { groups, tones, tuples } from "./catalog.ts";
import type { Display, Emoji, Group, Moment, Tone } from "./kinds.ts";

export type EmojiOptions = {
    folder?: string | undefined;
    format?: string | undefined;
    animated?: readonly string[] | undefined;
};
export type Files = { static: string[]; animated: string[] };
export type Emojis = {
    all: readonly Emoji[];
    groups: readonly Group[];
    tones: readonly Tone[];
    get: ( glyph: string ) => Emoji | undefined;
    search: ( query: string, limit?: number ) => Emoji[];
    of: ( group: string ) => Emoji[];
    tone: ( glyph: string, tone?: string | undefined ) => string;
    keyOf: ( glyph: string ) => string;
    staticOf: ( glyph: string ) => string | undefined;
    animatedOf: ( glyph: string ) => string | undefined;
    display: ( glyph: string, moment: Moment ) => Display;
    files: ( options?: { tones?: boolean | undefined } ) => Files;
};

const selector = /️/g;
const hasStatic = 1;
const hasAnimated = 2;
const hasTones = 4;
const light = tones[0]?.modifier ?? "";

export function plain ( glyph: string ): string {

    return glyph.replace(selector, "");

}
export function keyOf ( glyph: string ): string {

    return [...plain(glyph)].map(( character ) => (character.codePointAt(0) ?? 0).toString(16)).join("-");

}
function expand (): { all: Emoji[]; toned: Map<string, string> } {

    const toned = new Map<string, string>();
    const all = tuples.map(( [glyph, group, en, ar, enKeys, arKeys, lightGlyph, facts] ): Emoji => {

        if ( lightGlyph ) toned.set(plain(glyph), lightGlyph);

        return {
            glyph,
            key: keyOf(glyph),
            group: groups[group]?.key ?? "",
            name: { en, ar },
            keywords: { en: enKeys, ar: arKeys },
            toned: lightGlyph !== "",
            assets: { static: (facts & hasStatic) !== 0, animated: (facts & hasAnimated) !== 0, tones: (facts & hasTones) !== 0 },
        };

    });

    return { all, toned };

}
function baseOf ( glyph: string ): string {

    return plain(glyph).replace(/[\u{1F3FB}-\u{1F3FF}]/gu, "");

}
export function defineEmoji ( options: EmojiOptions = {} ): Emojis {

    const folder = options.folder ?? "images/emoji";
    const format = options.format ?? "webp";
    const { all, toned } = expand();
    const chosen = options.animated ? new Set(options.animated.map(plain)) : null;
    const index: Catalog<Emoji> = catalog(all, ( emoji ) => plain(emoji.glyph), ( emoji ) => [emoji.glyph, emoji.name.en, emoji.name.ar, ...emoji.keywords.en.split("|"), ...emoji.keywords.ar.split("|")].filter(Boolean));
    const get = ( glyph: string ): Emoji | undefined => index.get(plain(glyph)) ?? index.get(baseOf(glyph));
    const tone = ( glyph: string, key?: string | undefined ): string => {

        const base = get(glyph);
        const modifier = key ? tones.find(( entry ) => entry.key === key)?.modifier : undefined;
        const lightGlyph = base ? toned.get(plain(base.glyph)) : undefined;

        if ( !base ) return glyph;
        if ( !modifier || !lightGlyph ) return base.glyph;

        return lightGlyph.replaceAll(light, modifier);

    };
    const isToned = ( glyph: string ): boolean => plain(glyph) !== baseOf(glyph);
    const staticOf = ( glyph: string ): string | undefined => {

        const base = get(glyph);

        if ( !base?.assets.static || (isToned(glyph) && !base.assets.tones) ) return undefined;

        return `${folder}/static/${keyOf(glyph)}.${format}`;

    };
    const animatedOf = ( glyph: string ): string | undefined => {

        const base = get(glyph);

        if ( !base?.assets.animated || isToned(glyph) || (chosen && !chosen.has(plain(base.glyph))) ) return undefined;

        return `${folder}/animated/${base.key}.${format}`;

    };
    const fallback = ( glyph: string ): Display => {

        const still = staticOf(glyph);

        return still ? { kind: "static", src: still, glyph } : { kind: "glyph", glyph };

    };

    return {
        all,
        groups,
        tones,
        get,
        search: ( query, limit = 40 ) => index.search(query, limit),
        of: ( group ) => all.filter(( emoji ) => emoji.group === group),
        tone,
        keyOf,
        staticOf,
        animatedOf,
        display: ( glyph, moment ) => {

            if ( moment.context === "inline" ) return { kind: "glyph", glyph };
            if ( moment.context === "picker" || !moment.active || moment.reducedMotion ) return fallback(glyph);

            const moving = animatedOf(glyph);

            return moving ? { kind: "animated", src: moving, glyph } : fallback(glyph);

        },
        files: ( chosenFiles = {} ) => ({
            static: all.flatMap(( emoji ) => {

                if ( !emoji.assets.static ) return [];

                const variants = chosenFiles.tones && emoji.assets.tones ? tones.map(( entry ) => tone(emoji.glyph, entry.key)) : [];

                return [emoji.glyph, ...variants].map(( glyph ) => `${keyOf(glyph)}.${format}`);

            }),
            animated: all.filter(( emoji ) => animatedOf(emoji.glyph) !== undefined).map(( emoji ) => `${emoji.key}.${format}`),
        }),
    };

}
