declare module "subset-font" {
    export type Options = { targetFormat?: "truetype" | "woff" | "woff2" | "sfnt"; variationAxes?: Record<string, number> };
    export default function subsetFont ( font: Uint8Array, text: string, options?: Options ): Promise<Uint8Array>;
}
