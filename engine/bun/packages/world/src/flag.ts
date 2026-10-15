import { generatedPath } from "engine/base";

export type FlagFormat = "svg" | "webp";
export type FlagPlace = { folder?: string | undefined; format?: FlagFormat | undefined };

export const flagFolder = `${generatedPath}/world/flag`;

const indicator = 0x1f1e6;
const letter = 65;

export function flagEmoji ( code: string ): string {

    const upper = code.toUpperCase();

    return /^[A-Z]{2}$/.test(upper) ? String.fromCodePoint(...[...upper].map(( char ) => indicator + char.charCodeAt(0) - letter)) : "";

}
export function flagCode ( glyph: string ): string | undefined {

    const points = [...glyph].map(( char ) => char.codePointAt(0) ?? 0);

    if ( points.length !== 2 || points.some(( point ) => point < indicator || point > indicator + 25) ) return undefined;

    return String.fromCharCode(...points.map(( point ) => point - indicator + letter));

}
export function flagOf ( code: string, { folder = flagFolder, format = "svg" }: FlagPlace = {} ): string {

    return `${folder}/${code.toLowerCase()}.${format}`;

}
