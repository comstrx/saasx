import { base64 } from "engine/base";
import { dataUri } from "engine/file";
import {
    cssVariables,
    defineMotion,
    defineTokens,
    fontFace,
    fontFaces,
    fontOf,
    fontStack,
    languages,
    motionVariables,
    fonts as worldFonts,
} from "engine/world";
import { publishedUrls } from "./compile.ts";

type Face = { file: string; weight: string };
type Tokens = Parameters<typeof defineTokens>[0];
type Presets = Parameters<typeof defineMotion>[0];

export type ThemeInput = {
    colors: Tokens["colors"];
    fonts: Readonly<Record<string, readonly Face[]>>;
    locales: readonly string[];
    tokens: Omit<Tokens, "colors">;
    motion: Presets;
    assets: ReadonlyMap<string, Uint8Array>;
    icons: Uint8Array;
};

function face ( locale: string, font: Face, assets: ReadonlyMap<string, Uint8Array> ): string {

    if ( !assets.has(`fonts/${font.file}`) ) throw new Error(`Missing selected font: ${font.file}`);

    return fontFace({ family: `Site-${locale}`, src: publishedUrls(`/fonts/${font.file}`, assets), weight: font.weight });

}
function family ( locale: string, locales: string[] ): string {

    const stack = [locale, ...locales.filter(( other ) => other !== locale)].map(( name ) => `Site-${name}`);

    return `:root[lang="${locale}"] { --font-sans: ${fontStack(stack)}; }`;

}
function worldFamily ( locale: string ): string {

    const first = fontOf(languages.get(locale)?.script ?? "").family;
    const stack = [first, ...worldFonts.map(( font ) => font.family).filter(( family ) => family !== first)];

    return `:root[lang="${locale}"] { --font-sans: ${fontStack(stack)}; }`;

}
export function themeCss ( input: ThemeInput ): string {

    const fonts = Object.entries(input.fonts);
    const locales = fonts.map(( [locale] ) => locale);
    const tokens = defineTokens({ colors: input.colors, ...input.tokens });
    const motion = defineMotion(input.motion, false);
    const still = defineMotion(input.motion, true);
    const glyphs = fontFace({ family: "icons", src: dataUri("font/woff2", base64(input.icons)), weight: 400, display: "block" });

    return [
        motionVariables(motion, ":root"),
        `@media (prefers-reduced-motion: reduce) {\n${motionVariables(still, ":root")}\n}`,
        glyphs,
        ...(fonts.length ? fonts.flatMap(( [locale, faces] ) => faces.map(( font ) => face(locale, font, input.assets))) : fontFaces()),
        cssVariables(tokens, "light", ":root"),
        cssVariables(tokens, "dark", '[data-theme="dark"]'),
        `@media (prefers-color-scheme: dark) {\n${cssVariables(tokens, "dark", ':root:not([data-theme="light"])')}\n}`,
        ...(fonts.length ? locales.map(( locale ) => family(locale, locales)) : input.locales.map(worldFamily)),
        "",
    ].join("\n");

}
