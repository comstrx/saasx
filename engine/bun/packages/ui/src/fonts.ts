export type FontFace = {
    family: string;
    src: string;
    weight: number | string;
    style?: "normal" | "italic" | undefined;
    display?: "swap" | "block" | "optional" | "fallback" | undefined;
};

export function fontFace(face: FontFace): string {
    const parts = [
        `font-family: "${face.family}"`,
        `src: url("${face.src}")`,
        `font-weight: ${face.weight}`,
        `font-style: ${face.style ?? "normal"}`,
        `font-display: ${face.display ?? "swap"}`,
    ];

    return `@font-face { ${parts.join("; ")}; }`;
}
/**
 * The family stack for one locale: its own family first, every other locale's after, then the
 * generic fallback, so mixed-script text still resolves a glyph.
 */
export function fontStack(families: readonly string[], generic = "sans-serif"): string {
    return [...families.map((family) => `"${family}"`), generic].join(", ");
}
