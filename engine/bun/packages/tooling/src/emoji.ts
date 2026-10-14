import { type EmojiGroup, type EmojiMotion, type EmojiTone, type EmojiTuple, emojiKey, plainEmoji } from "@engine/world";

export type Row = { codes: readonly string[]; glyph: string; name: string; group: string };
export type Annotation = { name: string; keywords: readonly string[] };
export type Annotations = Map<string, Annotation>;
export type Catalog = { groups: readonly EmojiGroup[]; tones: readonly EmojiTone[]; tuples: readonly EmojiTuple[]; motions: Readonly<Record<string, EmojiMotion>> };
export type Coverage = { statics: ReadonlySet<string>; motions: ReadonlyMap<string, EmojiMotion> };

export const toneCodes = ["1F3FB", "1F3FC", "1F3FD", "1F3FE", "1F3FF"] as const;
export const toneKeys = ["light", "mediumLight", "medium", "mediumDark", "dark"] as const;
export const hasStatic = 1;
export const hasAnimated = 2;
export const hasTones = 4;

const groupLabels: Readonly<Record<string, EmojiGroup>> = {
    "Smileys & Emotion": { key: "smileys", name: { en: "Smileys & Emotion", ar: "أشكال تعبيرية ومشاعر" } },
    "People & Body": { key: "people", name: { en: "People & Body", ar: "أشخاص وجسد" } },
    "Animals & Nature": { key: "nature", name: { en: "Animals & Nature", ar: "حيوانات وطبيعة" } },
    "Food & Drink": { key: "food", name: { en: "Food & Drink", ar: "طعام وشراب" } },
    "Travel & Places": { key: "travel", name: { en: "Travel & Places", ar: "سفر وأماكن" } },
    Activities: { key: "activities", name: { en: "Activities", ar: "أنشطة" } },
    Objects: { key: "objects", name: { en: "Objects", ar: "أشياء" } },
    Symbols: { key: "symbols", name: { en: "Symbols", ar: "رموز" } },
    Flags: { key: "flags", name: { en: "Flags", ar: "أعلام" } },
};
const entities: Readonly<Record<string, string>> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&apos;": "'" };
const annotation = /<annotation cp="([^"]+)"( type="tts")?>([^<]*)<\/annotation>/g;
const lightTone = String.fromCodePoint(0x1f3fb);

export function flagCode ( glyph: string ): string | undefined {

    const points = [...plainEmoji(glyph)].map(( character ) => character.codePointAt(0) ?? 0);
    const letter = ( point: number, base: number ): string => String.fromCharCode(point - base + 97);

    if ( points.length === 2 && points.every(( point ) => point >= 0x1f1e6 && point <= 0x1f1ff) ) return points.map(( point ) => letter(point, 0x1f1e6)).join("");
    if ( points.length < 4 || points[0] !== 0x1f3f4 || points.at(-1) !== 0xe007f ) return undefined;

    const tag = points.slice(1, -1).map(( point ) => letter(point, 0xe0061)).join("");

    return `${tag.slice(0, 2)}-${tag.slice(2)}`;

}
export function parseEmojiTest ( text: string ): Row[] {

    const rows: Row[] = [];
    let group = "";

    for ( const line of text.split("\n") ) {

        if ( line.startsWith("# group: ") ) group = line.slice(9).trim();
        if ( !line.includes("; fully-qualified") ) continue;

        const [left, right] = line.split(";", 2) as [string, string];
        const codes = left.trim().split(/\s+/);
        const name = right.slice(right.indexOf("#") + 1).trim().split(/\s+/).slice(2).join(" ");

        rows.push({ codes, glyph: String.fromCodePoint(...codes.map(( code ) => Number.parseInt(code, 16))), name, group });

    }

    return rows;

}
export function parseAnnotations ( xml: string, into: Annotations = new Map() ): Annotations {

    for ( const match of xml.matchAll(annotation) ) {

        const [, cp = "", tts, raw = ""] = match;
        const text = raw.replace(/&[a-z]+;/g, ( entity ) => entities[entity] ?? entity).trim();
        const entry = into.get(plainEmoji(cp)) ?? { name: "", keywords: [] };

        into.set(plainEmoji(cp), tts ? { ...entry, name: text } : { ...entry, keywords: text.split("|").map(( word ) => word.trim()).filter(Boolean) });

    }

    return into;

}
export function toned ( row: Row ): boolean {

    return row.codes.some(( code ) => (toneCodes as readonly string[]).includes(code));

}
export function baseOf ( row: Row ): string {

    return String.fromCodePoint(...row.codes.filter(( code ) => !(toneCodes as readonly string[]).includes(code)).map(( code ) => Number.parseInt(code, 16)));

}
function keywords ( entry: Annotation | undefined, name: string ): string {

    const subject = name.includes(": ") ? [name.slice(name.indexOf(": ") + 2)] : [];

    return [...new Set([...subject, ...(entry?.keywords ?? [])])].filter(( word ) => word !== name).join("|");

}
export function buildCatalog ( rows: readonly Row[], en: Annotations, ar: Annotations, coverage: Coverage ): Catalog {

    const groups = Object.values(groupLabels);
    const light = new Map<string, string>();
    const tuples: EmojiTuple[] = [];

    for ( const row of rows ) {

        const used = row.codes.filter(( code ) => (toneCodes as readonly string[]).includes(code));

        if ( used.length && used.every(( code ) => code === "1F3FB") ) light.set(plainEmoji(baseOf(row)), row.glyph);

    }

    for ( const row of rows ) {

        const group = groups.findIndex(( entry ) => entry.name.en === row.group);

        if ( group === -1 || toned(row) ) continue;

        const key = plainEmoji(row.glyph);
        const english = en.get(key);
        const arabic = ar.get(key);

        if ( !arabic?.name ) throw new Error(`No Arabic annotation for ${row.name}`);

        const name = english?.name ?? row.name;
        const lightGlyph = light.get(key) ?? "";
        const variants = toneCodes.map(( code ) => emojiKey(lightGlyph.replaceAll(lightTone, String.fromCodePoint(Number.parseInt(code, 16)))));
        const facts = (coverage.statics.has(emojiKey(row.glyph)) ? hasStatic : 0) | (coverage.motions.has(emojiKey(row.glyph)) ? hasAnimated : 0) | (lightGlyph && variants.every(( variant ) => coverage.statics.has(variant)) ? hasTones : 0);

        tuples.push([row.glyph, group, name, arabic.name, keywords(english, name), keywords(arabic, arabic.name), lightGlyph, facts]);

    }

    const tones = toneCodes.map(( code, index ) => {

        const modifier = String.fromCodePoint(Number.parseInt(code, 16));
        const names = { en: en.get(modifier)?.name ?? "", ar: ar.get(modifier)?.name ?? "" };

        if ( !names.en || !names.ar ) throw new Error(`No annotation for skin tone ${code}`);

        return { key: toneKeys[index] as string, modifier, name: names };

    });

    const motions = Object.fromEntries(tuples.flatMap(( tuple ) => {

        const motion = coverage.motions.get(emojiKey(tuple[0]));

        return motion ? [[emojiKey(tuple[0]), motion]] : [];

    }));

    return { groups, tones, tuples, motions };

}
export function tonedGlyphs ( tuple: EmojiTuple ): string[] {

    return tuple[6] ? toneCodes.map(( code ) => tuple[6].replaceAll(lightTone, String.fromCodePoint(Number.parseInt(code, 16)))) : [];

}
export function catalogModule ( catalog: Catalog ): string {

    const lines = [
        'import type { EmojiGroup, EmojiMotion, EmojiTone, EmojiTuple } from "../kinds.ts";',
        "",
        `export const emojiGroups: readonly EmojiGroup[] = ${JSON.stringify(catalog.groups)};`,
        `export const emojiTones: readonly EmojiTone[] = ${JSON.stringify(catalog.tones)};`,
        `export const emojiMotions: Readonly<Record<string, EmojiMotion>> = ${JSON.stringify(catalog.motions)};`,
        "export const emojiTuples: readonly EmojiTuple[] = [",
        ...catalog.tuples.map(( tuple ) => `    ${JSON.stringify(tuple)},`),
        "];",
        "",
    ];

    return lines.join("\n");

}
