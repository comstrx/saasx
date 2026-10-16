import { generatedPath } from "engine/base";
import rows from "../data/fonts.json" with { type: "json" };

export type FontFile = { file: string; range: string };
export type Font = {
    family: string;
    scripts: readonly string[];
    weight: readonly [number, number];
    sizeAdjust: string;
    files: readonly FontFile[];
};
export type FontFace = {
    family: string;
    src: string;
    weight: number | string;
    style?: "normal" | "italic" | undefined;
    display?: "swap" | "block" | "optional" | "fallback" | undefined;
    range?: string | undefined;
    sizeAdjust?: string | undefined;
};

export const fontFolder = `${generatedPath}/world/font`;
export const fonts = rows as unknown as Font[];

const fallback = fonts.find(( font ) => !font.scripts.length) as Font;

export function fontOf ( script: string ): Font {

    return fonts.find(( font ) => font.scripts.includes(script)) ?? fallback;

}
export function fontFace ( face: FontFace ): string {

    const format = /\.woff2$|^data:font\/woff2[;,]/.test(face.src) ? ' format("woff2")' : "";
    const parts = [
        `font-family: "${face.family}"`,
        `src: url("${face.src}")${format}`,
        `font-weight: ${face.weight}`,
        `font-style: ${face.style ?? "normal"}`,
        `font-display: ${face.display ?? "swap"}`,
        ...(face.range ? [`unicode-range: ${face.range}`] : []),
        ...(face.sizeAdjust && face.sizeAdjust !== "100%" ? [`size-adjust: ${face.sizeAdjust}`] : []),
    ];

    return `@font-face { ${parts.join("; ")}; }`;

}
export function fontFaces ( folder = fontFolder ): string[] {

    return fonts.flatMap(( font ) => font.files.map(( face ) => fontFace({
        family: font.family,
        src: `${folder}/${face.file}`,
        weight: font.weight.join(" "),
        range: face.range,
        sizeAdjust: font.sizeAdjust,
    })));

}
export function fontStack ( families: readonly string[], generic = "sans-serif" ): string {

    return [...families.map(( family ) => `"${family}"`), generic].join(", ");

}
