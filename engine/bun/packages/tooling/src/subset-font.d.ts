declare module "subset-font" {
    export default function subsetFont ( font: Uint8Array, text: string, options?: { targetFormat?: "truetype" | "woff" | "woff2" | "sfnt"; variationAxes?: Record<string, number> } ): Promise<Uint8Array>;
}
