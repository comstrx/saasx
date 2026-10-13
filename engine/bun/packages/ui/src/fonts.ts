export type FontFace = {
    family: string;
    src: string;
    weight: number | string;
    style?: "normal" | "italic" | undefined;
    display?: "swap" | "block" | "optional" | "fallback" | undefined;
};

export function fontFace ( face: FontFace ): string {

    const parts = [
        `font-family: "${face.family}"`,
        `src: url("${face.src}")`,
        `font-weight: ${face.weight}`,
        `font-style: ${face.style ?? "normal"}`,
        `font-display: ${face.display ?? "swap"}`,
    ];

    return `@font-face { ${parts.join("; ")}; }`;

}

export function fontStack ( families: readonly string[], generic = "sans-serif" ): string {

    return [...families.map(( family ) => `"${family}"`), generic].join(", ");

}
