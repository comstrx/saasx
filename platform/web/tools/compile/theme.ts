import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { CompiledConfig } from "../../src/lib/spec/contract.ts";
import { languages } from "../../src/lib/spec/languages.ts";
import { keysOf } from "../../src/lib/std/object.ts";
import { root } from "../core/index.ts";

type Face = { file: string; weight: string };
type Fonts = (readonly [string, Face[]])[];

function fonts ( config: CompiledConfig ): Fonts {

    return Object.entries(config.settings.fonts).map(( [locale, faces] ) => {

        return [locale, typeof faces === "string" ? [{ file: faces, weight: "100 900" }] : faces] as const;

    });

}
function face ( locale: string, font: Face, assets: ReadonlyMap<string, Buffer> ): string {

    const range = languages[locale as keyof typeof languages]?.range;

    if ( !assets.has(`assets/fonts/${font.file}`) ) throw new Error(`Missing selected font: ${font.file}`);

    return [
        `@font-face { font-family: "Site-${locale}"; src: url("/assets/fonts/${font.file}");`,
        `font-weight: ${font.weight}; font-style: normal; font-display: swap;${range ? ` unicode-range: ${range};` : ""} }`,
    ].join(" ");

}
function palette ( theme: string, colors: Record<string, string> ): string {

    const tokens = Object.entries(colors).map(( [name, color] ) => `    --${name}: ${color};`);

    return `${theme === "light" ? ":root" : '[data-theme="dark"]'} {\n${tokens.join("\n")}\n}`;

}
function family ( locale: string, locales: string[] ): string {

    const stack = [locale, ...locales.filter(( other ) => other !== locale)].map(( name ) => `"Site-${name}"`);

    return `:root[lang="${locale}"] { --font-sans: ${[...stack, "sans-serif"].join(", ")}; }`;

}
export function themeCss ( config: CompiledConfig, assets: ReadonlyMap<string, Buffer> ): string {

    const selected = fonts(config);
    const locales = selected.map(( [locale] ) => locale);

    return [
        ...selected.flatMap(( [locale, faces] ) => faces.map(( font ) => face(locale, font, assets))),
        ...Object.entries(config.theme.colors).map(( [theme, colors] ) => palette(theme, colors)),
        ...locales.map(( locale ) => family(locale, locales)),
    ].join("\n");

}
export function resolvePalette ( source: CompiledConfig["theme"]["colors"] ): CompiledConfig["theme"]["colors"] {

    const css = readFileSync(resolve(root, "src/styles/tokens.css"), "utf8");
    const definitions = [...css.matchAll(/(--palette-[a-z-]+):\s*(#[a-fA-F0-9]{6}(?:[a-fA-F0-9]{2})?)\s*;/g)];
    const values = new Map(definitions.map(( match ) => [match[1], match[2]]));

    const colors = { light: { ...source.light }, dark: { ...source.dark } };

    for ( const palette of Object.values(colors) ) {

        for ( const key of keysOf(palette) ) {

            const value = palette[key];

            if ( !value.startsWith("var(") ) continue;

            const resolved = values.get(value.slice(4, -1));

            if ( !resolved ) throw new Error(`Missing palette token: ${value}`);
            palette[key] = resolved;

        }

    }

    return colors;

}
export function resolveTheme ( config: CompiledConfig ): CompiledConfig {

    return { ...config, theme: { ...config.theme, colors: resolvePalette(config.theme.colors) } };

}
