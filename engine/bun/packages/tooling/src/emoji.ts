import type { Group, Tone, Tuple } from "@engine/emoji";

export type Row = { codes: readonly string[]; glyph: string; name: string; group: string };
export type Annotation = { name: string; keywords: readonly string[] };
export type Annotations = Map<string, Annotation>;
export type Catalog = { groups: readonly Group[]; tones: readonly Tone[]; tuples: readonly Tuple[] };
export type Coverage = { statics: ReadonlySet<string>; animated: ReadonlySet<string> };

export const toneCodes = ["1F3FB", "1F3FC", "1F3FD", "1F3FE", "1F3FF"] as const;
export const toneKeys = ["light", "mediumLight", "medium", "mediumDark", "dark"] as const;
export const hasStatic = 1;
export const hasAnimated = 2;
export const hasTones = 4;

const groupLabels: Readonly<Record<string, Group>> = {
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
const selector = /️/g;
const lightTone = String.fromCodePoint(0x1f3fb);

export function plain ( glyph: string ): string {

    return glyph.replace(selector, "");

}
export function keyOf ( glyph: string ): string {

    return [...plain(glyph)].map(( character ) => (character.codePointAt(0) ?? 0).toString(16)).join("-");

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
        const entry = into.get(plain(cp)) ?? { name: "", keywords: [] };

        into.set(plain(cp), tts ? { ...entry, name: text } : { ...entry, keywords: text.split("|").map(( word ) => word.trim()).filter(Boolean) });

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
    const tuples: Tuple[] = [];

    for ( const row of rows ) {

        const used = row.codes.filter(( code ) => (toneCodes as readonly string[]).includes(code));

        if ( used.length && used.every(( code ) => code === "1F3FB") ) light.set(plain(baseOf(row)), row.glyph);

    }

    for ( const row of rows ) {

        const group = groups.findIndex(( entry ) => entry.name.en === row.group);

        if ( group === -1 || toned(row) ) continue;

        const key = plain(row.glyph);
        const english = en.get(key);
        const arabic = ar.get(key);

        if ( !arabic?.name ) throw new Error(`No Arabic annotation for ${row.name}`);

        const name = english?.name ?? row.name;
        const lightGlyph = light.get(key) ?? "";
        const variants = toneCodes.map(( code ) => keyOf(lightGlyph.replaceAll(lightTone, String.fromCodePoint(Number.parseInt(code, 16)))));
        const facts = (coverage.statics.has(keyOf(row.glyph)) ? hasStatic : 0) | (coverage.animated.has(keyOf(row.glyph)) ? hasAnimated : 0) | (lightGlyph && variants.every(( variant ) => coverage.statics.has(variant)) ? hasTones : 0);

        tuples.push([row.glyph, group, name, arabic.name, keywords(english, name), keywords(arabic, arabic.name), lightGlyph, facts]);

    }

    const tones = toneCodes.map(( code, index ) => {

        const modifier = String.fromCodePoint(Number.parseInt(code, 16));
        const names = { en: en.get(modifier)?.name ?? "", ar: ar.get(modifier)?.name ?? "" };

        if ( !names.en || !names.ar ) throw new Error(`No annotation for skin tone ${code}`);

        return { key: toneKeys[index] as string, modifier, name: names };

    });

    return { groups, tones, tuples };

}
export function tonedGlyphs ( tuple: Tuple ): string[] {

    return tuple[6] ? toneCodes.map(( code ) => tuple[6].replaceAll(lightTone, String.fromCodePoint(Number.parseInt(code, 16)))) : [];

}
export function catalogModule ( catalog: Catalog ): string {

    const lines = [
        'import type { Group, Tone, Tuple } from "./kinds.ts";',
        "",
        `export const groups: readonly Group[] = ${JSON.stringify(catalog.groups)};`,
        `export const tones: readonly Tone[] = ${JSON.stringify(catalog.tones)};`,
        "export const tuples: readonly Tuple[] = [",
        ...catalog.tuples.map(( tuple ) => `    ${JSON.stringify(tuple)},`),
        "];",
        "",
    ];

    return lines.join("\n");

}
