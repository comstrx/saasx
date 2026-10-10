const providers: Record<string, { name: string; glyph: string }> = {
    google: { name: "Google", glyph: "google" },
    apple: { name: "Apple", glyph: "apple" },
    facebook: { name: "Facebook", glyph: "facebook" },
    github: { name: "GitHub", glyph: "github" },
    microsoft: { name: "Microsoft", glyph: "microsoft" },
    twitter: { name: "X", glyph: "x-logo" },
    linkedin: { name: "LinkedIn", glyph: "linkedin" },
};

export function socialName ( provider: string ): string {

    return providers[provider]?.name ?? provider;

}
export function socialGlyph ( provider: string ): string {

    return providers[provider]?.glyph ?? "link";

}
