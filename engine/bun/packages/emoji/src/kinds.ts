export type Named = { en: string; ar: string };
export type Group = { key: string; name: Named };
export type Tone = { key: string; modifier: string; name: Named };
export type Tuple = readonly [glyph: string, group: number, en: string, ar: string, enKeys: string, arKeys: string, toned: string, facts: number];
export type Emoji = {
    glyph: string;
    key: string;
    group: string;
    name: Named;
    keywords: Named;
    toned: boolean;
    assets: { static: boolean; animated: boolean; tones: boolean };
};
export type Context = "inline" | "picker" | "standalone" | "reaction";
export type Display = { kind: "glyph"; glyph: string } | { kind: "static"; src: string; glyph: string } | { kind: "animated"; src: string; glyph: string };
export type Moment = { context: Context; active?: boolean | undefined; reducedMotion?: boolean | undefined };
