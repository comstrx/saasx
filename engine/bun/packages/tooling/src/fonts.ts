/// <reference path="./subset-font.d.ts" />

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fonts } from "engine/world";
import subsetFont from "subset-font";
import { worldAssets } from "./compile.ts";

export type StaticFont = { family: string; weight: number; file: string; bytes: Uint8Array };

const everyCharacter = Array.from({ length: 0xffff }, ( _, index ) => index + 1)
    .filter(( code ) => code < 0xd800 || code > 0xdfff)
    .map(( code ) => String.fromCodePoint(code))
    .join("");

export async function staticFonts ( weights: readonly number[] ): Promise<StaticFont[]> {

    const files: StaticFont[] = [];

    for ( const font of fonts ) {

        const source = readFileSync(resolve(worldAssets, "font", (font.files[0] as { file: string }).file));
        const slug = font.family.toLowerCase().replaceAll(" ", "-");

        for ( const weight of weights.filter(( weight ) => weight >= font.weight[0] && weight <= font.weight[1]) ) {

            const bytes = await subsetFont(source, everyCharacter, { targetFormat: "truetype", variationAxes: { wght: weight } });

            files.push({ family: font.family, weight, file: `${slug}-${weight}.ttf`, bytes: new Uint8Array(bytes) });

        }

    }

    return files;

}
