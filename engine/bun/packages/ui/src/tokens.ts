export type Scheme = "light" | "dark";
export type Palette = Record<string, string>;
export type Face = { size: number; line: number; weight: 400 | 500 | 600 | 700 };
export type Tokens = {
    colors: Record<Scheme, Palette>;
    space: Record<string, number>;
    radius: Record<string, number>;
    type: Record<string, Face>;
};
export type TokensInput = {
    colors?: { light?: Palette | undefined; dark?: Palette | undefined } | undefined;
    space?: Record<string, number> | undefined;
    radius?: Record<string, number> | undefined;
    type?: Record<string, Face> | undefined;
};
export type NativeTokens = {
    colors: Palette;
    space: Record<string, number>;
    radius: Record<string, number>;
    type: Record<string, Face>;
};

export const space = { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 6: 24, 8: 32, 12: 48 } as const;
export const radius = { none: 0, sm: 6, md: 12, lg: 20, full: 9999 } as const;
export const type = {
    xs: { size: 12, line: 16, weight: 400 },
    sm: { size: 14, line: 20, weight: 400 },
    md: { size: 16, line: 24, weight: 400 },
    lg: { size: 20, line: 28, weight: 600 },
    xl: { size: 28, line: 36, weight: 700 },
} as const satisfies Record<string, Face>;

const rem = (px: number): string => (px === 0 ? "0" : `${px / 16}rem`);

/**
 * The token set of a surface: the engine's scales patched by what the surface gives, each color
 * scheme its own palette.
 */
export function defineTokens(input: TokensInput = {}): Tokens {
    return {
        colors: { light: { ...input.colors?.light }, dark: { ...input.colors?.dark } },
        space: { ...space, ...input.space },
        radius: { ...radius, ...input.radius },
        type: { ...type, ...input.type },
    };
}
/**
 * One scheme's tokens as CSS custom properties under a selector: colors by name, space as
 * `--gap-*` in rem, radius as `--radius-*`, type as `--type-*-size|line|weight`.
 */
export function cssVariables(tokens: Tokens, scheme: Scheme, selector: string): string {
    const lines = [
        ...Object.entries(tokens.colors[scheme]).map(([name, value]) => `--${name}: ${value};`),
        ...Object.entries(tokens.space).map(([step, px]) => `--gap-${step}: ${rem(px)};`),
        ...Object.entries(tokens.radius).map(([name, px]) => `--radius-${name}: ${px >= 9999 ? "999rem" : rem(px)};`),
        ...Object.entries(tokens.type).flatMap(([name, face]) => [
            `--type-${name}-size: ${rem(face.size)};`,
            `--type-${name}-line: ${rem(face.line)};`,
            `--type-${name}-weight: ${face.weight};`,
        ]),
    ];

    return `${selector} {\n${lines.map((line) => `    ${line}`).join("\n")}\n}`;
}
/**
 * One scheme's tokens as the plain numbers a native style sheet takes.
 */
export function nativeTokens(tokens: Tokens, scheme: Scheme): NativeTokens {
    return {
        colors: tokens.colors[scheme],
        space: { ...tokens.space },
        radius: tokens.radius,
        type: tokens.type,
    };
}
