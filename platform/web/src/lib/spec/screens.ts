import { entities, entityKinds } from "../../api/features/index.ts";
import { z } from "../providers/schema.ts";
import { key, path, specText } from "./fields.ts";

const step = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(6), z.literal(8), z.literal(12)]);
const count = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)]);
const columns = z.union([count, z.partialRecord(z.enum(["base", "sm", "md", "lg", "xl"]), count)]);
const kind = z.enum(entityKinds);
const entity = z.union([kind, z.strictObject({ kind, parameter: key.optional(), types: z.array(key).min(1).max(50).optional() })]);
const options = z.record(z.string(), z.unknown());

export const screenOptions = z.strictObject({
    render: z.enum(["server", "client"]),
    title: z.boolean(),
    seo: z.boolean(),
    index: z.boolean(),
    nav: z.boolean(),
    footer: z.union([z.boolean(), z.literal("copyright")]),
    sidebar: z.boolean(),
    loader: z.boolean(),
});
export const blockOptions = z.strictObject({
    width: z.enum(["auto", "full", "half", "third", "two-thirds", "quarter", "narrow", "wide"]),
    height: z.enum(["auto", "screen"]),
    grid: columns,
    sizes: z.array(z.number().int().min(1).max(12)).max(12),
    gap: step,
    padding: step,
    align: z.enum(["start", "center", "end", "stretch"]),
    tone: z.enum(["default", "surface", "primary", "inverse"]),
    radius: z.enum(["none", "sm", "md", "lg", "xl"]),
    shadow: z.enum(["none", "sm", "md", "lg"]),
});
export const shellShape = z.strictObject({
    nav: key.nullable(),
    footer: key.nullable(),
    sidebar: key.nullable(),
    loader: key.nullable(),
});
const featureShape: z.ZodType<SiteFeature, SiteFeature> = z.lazy(() => z.strictObject({
    name: key,
    id: key.optional(),
    heading: z.boolean().optional(),
    options: options.optional(),
    features: z.array(featureShape).max(50).optional(),
    blocks: z.array(blockShape).max(50).optional(),
}));
const blockShape: z.ZodType<SiteBlock, SiteBlock> = z.lazy(() => z.strictObject({
    id: key.optional(),
    options: blockOptions.partial().optional(),
    features: z.array(featureShape).max(50).optional(),
    blocks: z.array(blockShape).max(50).optional(),
}));
const screenContents = z.strictObject({
    name: key,
    path,
    title: specText,
    label: specText.optional(),
    description: specText,
    icon: key.optional(),
    entity: entity.optional(),
    article: z.strictObject({
        publishedAt: z.iso.datetime({ offset: true }),
        modifiedAt: z.iso.datetime({ offset: true }).optional(),
        author: specText.optional(),
    }).optional(),
});
const screenShape = z.strictObject({
    contents: screenContents,
    options: screenOptions.partial().optional(),
    blocks: z.array(blockShape).max(100),
});
export const schemaShape = z.strictObject({
    screens: z.array(screenShape),
});

type Options = Record<string, unknown>;
type ScreenContents = z.output<typeof screenContents>;

export type SiteSchemaInput = z.input<typeof schemaShape>;
export type SiteScreen = z.output<typeof screenShape>;
export type ScreenOptions = z.output<typeof screenOptions>;
export type BlockOptions = z.output<typeof blockOptions>;
export type Shell = z.output<typeof shellShape>;
export type SiteFeature = {
    name: string;
    id?: string;
    heading?: boolean;
    options?: Options;
    features?: SiteFeature[];
    blocks?: SiteBlock[];
};
export type SiteBlock = { id?: string; options?: Partial<BlockOptions>; features?: SiteFeature[]; blocks?: SiteBlock[] };
export type CompiledFeature = {
    name: string;
    id: string;
    heading: boolean;
    options: Options;
    features: CompiledFeature[];
    blocks: CompiledBlock[];
};
export type CompiledBlock = { id: string; options: BlockOptions; features: CompiledFeature[]; blocks: CompiledBlock[] };
export type CompiledScreen = ScreenContents & { options: ScreenOptions; blocks: CompiledBlock[]; features: string[] };
export type CompiledSchema = { screens: CompiledScreen[]; features: string[]; shell: Record<keyof Shell, Options> };
export type EntityRoute = { path: string; kind: typeof entityKinds[number]; parameter: string; types: string[] | null };

export function entityRoute ( screen: CompiledScreen ): EntityRoute | null {

    if ( !screen.entity ) return null;
    if ( typeof screen.entity === "string" ) return { path: screen.path, kind: screen.entity, parameter: entities[screen.entity].parameter, types: null };

    const { kind, parameter = entities[kind].parameter, types } = screen.entity;

    return { path: screen.path, kind, parameter, types: types ?? null };

}
