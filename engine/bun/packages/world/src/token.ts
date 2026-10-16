export type Scheme = "light" | "dark";
export type Palette = Record<string, string>;
export type Face = { size: number; line: number; weight: 400 | 500 | 600 | 700 };
export type Tokens = {
    colors: Record<Scheme, Palette>;
    space: Record<string, number>;
    radius: Record<string, number>;
    type: Record<string, Face>;
};
export type NativeTokens = {
    colors: Palette;
    space: Record<string, number>;
    radius: Record<string, number>;
    type: Record<string, Face>;
};

const rem = ( px: number ): string => (px === 0 ? "0" : `${px / 16}rem`);

export function defineTokens ( input: Tokens ): Tokens {

    return {
        colors: { light: { ...input.colors.light }, dark: { ...input.colors.dark } },
        space: { ...input.space },
        radius: { ...input.radius },
        type: { ...input.type },
    };

}
export function cssVariables ( tokens: Tokens, scheme: Scheme, selector: string ): string {

    const lines = [
        ...Object.entries(tokens.colors[scheme]).map(( [name, value] ) => `--${name}: ${value};`),
        ...Object.entries(tokens.space).map(( [step, px] ) => `--gap-${step}: ${rem(px)};`),
        ...Object.entries(tokens.radius).map(( [name, px] ) => `--radius-${name}: ${px >= 9999 ? "999rem" : rem(px)};`),
        ...Object.entries(tokens.type).flatMap(( [name, face] ) => [
            `--type-${name}-size: ${rem(face.size)};`,
            `--type-${name}-line: ${rem(face.line)};`,
            `--type-${name}-weight: ${face.weight};`,
        ]),
    ];

    return cssBlock(selector, lines);

}
export function cssBlock ( selector: string, lines: readonly string[] ): string {

    return `${selector} {\n${lines.map(( line ) => `    ${line}`).join("\n")}\n}`;

}
export function nativeTokens ( tokens: Tokens, scheme: Scheme ): NativeTokens {

    return {
        colors: tokens.colors[scheme],
        space: { ...tokens.space },
        radius: tokens.radius,
        type: tokens.type,
    };

}
