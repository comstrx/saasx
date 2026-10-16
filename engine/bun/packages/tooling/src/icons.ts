/// <reference path="./subset-font.d.ts" />

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import subsetFont from "subset-font";

export type IconFormat = "truetype" | "woff2";
export type IconFont = { codepoints: Record<string, number>; bytes: Uint8Array };

const fontFolder = resolve(dirname(Bun.resolveSync("lucide-static/package.json", import.meta.dir)), "font");

export async function iconFont (
    names: readonly string[],
    aliases: Readonly<Record<string,
    string>>,
    format: IconFormat,
): Promise<IconFont> {

    const known = JSON.parse(readFileSync(resolve(fontFolder, "codepoints.json"), "utf8")) as Record<string, number>;
    const missing = names.filter(( name ) => known[aliases[name] ?? name] === undefined);

    if ( missing.length ) throw new Error(`No icon drawing for: ${missing.join(", ")}`);

    const codepoints = Object.fromEntries(names.map(( name ) => [name, known[aliases[name] ?? name] as number]));
    const text = Object.values(codepoints).map(( code ) => String.fromCodePoint(code)).join("");
    const bytes = await subsetFont(readFileSync(resolve(fontFolder, "lucide.ttf")), text, { targetFormat: format });

    return { codepoints, bytes: new Uint8Array(bytes) };

}
