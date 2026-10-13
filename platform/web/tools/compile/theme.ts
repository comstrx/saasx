import { cssVariables, defineTokens, fontFace, fontStack } from "@engine/ui";
import type { CompiledConfig } from "../../src/lib/spec/surface.ts";

type Face = { file: string; weight: string };

function face ( locale: string, font: Face, assets: ReadonlyMap<string, Uint8Array> ): string {

    if ( !assets.has(`assets/fonts/${font.file}`) ) throw new Error(`Missing selected font: ${font.file}`);

    return fontFace({ family: `Site-${locale}`, src: `/assets/fonts/${font.file}`, weight: font.weight });

}
function family ( locale: string, locales: string[] ): string {

    const stack = [locale, ...locales.filter(( other ) => other !== locale)].map(( name ) => `Site-${name}`);

    return `:root[lang="${locale}"] { --font-sans: ${fontStack(stack)}; }`;

}
export function themeCss ( config: CompiledConfig, assets: ReadonlyMap<string, Uint8Array> ): string {

    const fonts = Object.entries(config.settings.fonts);
    const locales = fonts.map(( [locale] ) => locale);
    const tokens = defineTokens({ colors: config.theme.colors });

    return [
        ...fonts.flatMap(( [locale, faces] ) => faces.map(( font ) => face(locale, font, assets))),
        cssVariables(tokens, "light", ":root"),
        cssVariables(tokens, "dark", '[data-theme="dark"]'),
        `@media (prefers-color-scheme: dark) {\n${cssVariables(tokens, "dark", ':root:not([data-theme="light"])')}\n}`,
        ...locales.map(( locale ) => family(locale, locales)),
        "",
    ].join("\n");

}
