import { publishedUrls } from "@engine/tooling";
import { cssVariables, defineMotion, defineTokens, fontFace, fontStack } from "@engine/ui";
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
export function themeCss ( config: CompiledConfig, assets: ReadonlyMap<string, Uint8Array>, icons: Uint8Array ): string {

    const fonts = Object.entries(config.settings.fonts);
    const locales = fonts.map(( [locale] ) => locale);
    const tokens = defineTokens({ colors: config.theme.colors, space, radius, type });
    const motion = defineMotion(presets, false);
    const motionCss = `:root { ${Object.entries(motion.durations).map(( [name, ms] ) => `--motion-${name}: ${ms}ms;`).join(" ")} ${Object.entries(motion.easings).map(( [name, curve] ) => `--ease-${name}: ${curve};`).join(" ")} }`;

    return [
        motionCss,
        "@media (prefers-reduced-motion: reduce) { :root { --motion-fast: 0ms; --motion-base: 0ms; --motion-slow: 0ms; --motion-expressive: 0ms; } }",
        `@font-face { font-family: "icons"; src: url("data:font/woff2;base64,${Buffer.from(icons).toString("base64")}") format("woff2"); font-display: block; }`,
        ...fonts.flatMap(( [locale, faces] ) => faces.map(( font ) => face(locale, font, assets))),
        cssVariables(tokens, "light", ":root"),
        cssVariables(tokens, "dark", '[data-theme="dark"]'),
        `@media (prefers-color-scheme: dark) {\n${cssVariables(tokens, "dark", ':root:not([data-theme="light"])')}\n}`,
        ...locales.map(( locale ) => family(locale, locales)),
        "",
    ].join("\n");

}
