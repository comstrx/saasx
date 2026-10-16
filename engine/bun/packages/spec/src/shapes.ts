import { type FieldFact, key, word, z } from "engine/validate";
import { operation } from "./fields.ts";

const scalar = z.union([z.string().max(2048), z.number().finite(), z.boolean(), z.null()]);
const reference = z.union([
    z.strictObject({ param: key }),
    z.strictObject({ query: key }),
    z.strictObject({ signal: key, wait: z.boolean().optional() }),
]);
const value = z.union([scalar, reference]);
const column = z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/);
const leaf = z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*$/);
const input = z.record(column, value);
const channel = z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-zA-Z0-9_.:-]+$/);
const portKinds = ["list", "one", "write"] as const;
const options = z.record(z.string(), z.unknown());

export const patchShape = z.strictObject({
    path: z.string().min(1).max(100),
    key: column.default("id"),
    version: column.optional(),
});
export const liveShape = z.strictObject({
    channel,
    events: z.array(channel).max(10).default([]),
    patch: patchShape.optional(),
});
export const bindingShape = z.union([
    z.strictObject({ read: operation, input: input.optional(), live: liveShape.optional() }),
    z.strictObject({ write: operation, input: input.optional(), fields: z.array(leaf).max(50).optional() }),
    z.strictObject({
        data: z.union([z.array(z.record(z.string(), z.unknown())).max(500), z.record(z.string(), z.unknown())]),
    }),
    z.strictObject({ site: z.union([z.literal("$"), word]) }),
]);
export const portShape = z.strictObject({
    kind: z.enum(portKinds),
    fields: z.array(word).max(50).optional(),
    required: z.boolean().optional(),
});
export const manifestShape = z.strictObject({
    owner: z.enum(["server", "client"]),
    options: options.default({}),
    ports: z.record(word, portShape).default({}),
    access: z.array(key).max(20).default([]),
    signals: z.array(key).max(20).default([]),
});
export const accessShape = z.union([
    z.literal("any"),
    z.literal("guest"),
    z.literal("user"),
    z.array(key).min(1).max(20),
]);
export const optionsShape = options;

export type Options = Record<string, unknown>;
export type Value = z.output<typeof value>;
export type Binding = z.output<typeof bindingShape>;
export type Live = z.output<typeof liveShape>;
export type Patch = z.output<typeof patchShape>;
export type LiveInput = z.input<typeof liveShape>;
export type Port = z.output<typeof portShape>;
export type Manifest = z.output<typeof manifestShape>;
export type ManifestInput = z.input<typeof manifestShape>;
export type Access = z.output<typeof accessShape>;
export type Owner = Manifest["owner"];
export type Reference = z.output<typeof reference>;
export type Input = Record<string, Value>;
export type SiteFeature<B> = {
    name: string;
    id?: string | undefined;
    heading?: boolean | undefined;
    access?: string[] | undefined;
    options?: Options | undefined;
    ports?: Record<string, Binding> | undefined;
    features?: SiteFeature<B>[] | undefined;
    blocks?: SiteBlock<B>[] | undefined;
};
export type SiteBlock<B> = {
    id?: string | undefined;
    options?: Partial<B> | undefined;
    features?: SiteFeature<B>[] | undefined;
    blocks?: SiteBlock<B>[] | undefined;
};
export type CompiledPort =
    | { kind: "read"; feature: string; operation: string; input: Input; many: boolean; live?: Live | undefined }
    | {
          kind: "write";
          feature: string;
          operation: string;
          input: Input;
          fields: FieldFact[];
          touches: string[];
          permissions: string[];
      }
    | { kind: "data"; value: unknown }
    | { kind: "site"; path: string };
export type CompiledFeature<B> = {
    name: string;
    id: string;
    slug: string;
    heading: boolean;
    owner: Owner;
    access: string[];
    options: Options;
    ports: Record<string, CompiledPort>;
    features: CompiledFeature<B>[];
    blocks: CompiledBlock<B>[];
};
export type CompiledBlock<B> = { id: string; options: B; features: CompiledFeature<B>[]; blocks: CompiledBlock<B>[] };

export function treeShapes<S extends z.ZodObject> (
    blockOptions: S,
): { feature: z.ZodType<SiteFeature<z.output<S>>>; block: z.ZodType<SiteBlock<z.output<S>>> } {

    type B = z.output<S>;

    const feature: z.ZodType<SiteFeature<B>> = z.lazy(() =>
        z.strictObject({
            name: key,
            id: key.optional(),
            heading: z.boolean().optional(),
            access: z.array(key).max(20).optional(),
            options: options.optional(),
            ports: z.record(word, bindingShape).optional(),
            features: z.array(feature).max(50).optional(),
            blocks: z.array(block).max(50).optional(),
        }),
    ) as z.ZodType<SiteFeature<B>>;
    const block: z.ZodType<SiteBlock<B>> = z.lazy(() =>
        z.strictObject({
            id: key.optional(),
            options: blockOptions.partial().optional(),
            features: z.array(feature).max(50).optional(),
            blocks: z.array(block).max(50).optional(),
        }),
    ) as z.ZodType<SiteBlock<B>>;

    return { feature, block };

}
