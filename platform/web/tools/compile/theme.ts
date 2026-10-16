import { base64 } from "engine/base";
import { dataUri } from "engine/file";
import { publishedUrls } from "engine/tooling";
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
import type { CompiledConfig } from "../../src/lib/spec/surface.ts";
import { motion as presets, radius, space, type } from "../../src/lib/spec/theme.ts";

type Face = { file: string; weight: string };

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
export function themeCss ( config: CompiledConfig, assets: ReadonlyMap<string, Uint8Array>, icons: Uint8Array ): string {

    const fonts = Object.entries(config.settings.fonts);
    const locales = fonts.map(( [locale] ) => locale);
    const tokens = defineTokens({ colors: config.theme.colors, space, radius, type });
    const motion = defineMotion(presets, false);
    const still = defineMotion(presets, true);
    const glyphs = fontFace({ family: "icons", src: dataUri("font/woff2", base64(icons)), weight: 400, display: "block" });

    return [
        motionVariables(motion, ":root"),
        `@media (prefers-reduced-motion: reduce) {\n${motionVariables(still, ":root")}\n}`,
        glyphs,
        ...(fonts.length ? fonts.flatMap(( [locale, faces] ) => faces.map(( font ) => face(locale, font, assets))) : fontFaces()),
        cssVariables(tokens, "light", ":root"),
        cssVariables(tokens, "dark", '[data-theme="dark"]'),
        `@media (prefers-color-scheme: dark) {\n${cssVariables(tokens, "dark", ':root:not([data-theme="light"])')}\n}`,
        ...(fonts.length ? locales.map(( locale ) => family(locale, locales)) : config.settings.locale.enabled.map(worldFamily)),
        "",
    ].join("\n");

}
