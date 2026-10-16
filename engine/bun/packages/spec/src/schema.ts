import { key, path, z } from "engine/validate";
import { specText } from "./fields.ts";
import type { ShellPart } from "./settings.ts";
import { accessShape, type CompiledBlock, treeShapes } from "./shapes.ts";

export type Entities = Readonly<Record<string, { parameter: string; list?: string | undefined }>>;
export type EntityRoute = { path: string; kind: string; parameter: string };
export type EntityRef = string | { kind: string; parameter?: string | undefined };
export type CompiledScreenBase<C, O, B extends object> = C & {
    options: O;
    access: z.output<typeof accessShape>;
    redirect: string | null;
    blocks: CompiledBlock<B>[];
    features: string[];
    operations: string[];
};
export type CompiledSchemaBase<S, K extends string> = {
    screens: S[];
    features: string[];
    operations: string[];
    shell: Record<K, ShellPart>;
};

export function countShape ( max: number ) {

    return z.number().int().min(1).max(max);

}
export function entityShape ( entities: Entities ) {

    const kinds = Object.keys(entities);
    const kind = z.string().refine(( value ) => kinds.includes(value), "Unknown entity kind.");

    return z.union([kind, z.strictObject({ kind, parameter: key.optional() })]);

}
export function entityRoute (
    entities: Entities,
    screen: { entity?: EntityRef | undefined; path: string },
): EntityRoute | null {

    if ( !screen.entity ) return null;

    const chosen = typeof screen.entity === "string" ? { kind: screen.entity } : screen.entity;
    const parameter = chosen.parameter ?? entities[chosen.kind]?.parameter ?? "id";

    return { path: screen.path, kind: chosen.kind, parameter };

}
export function screenShapes<S extends z.ZodObject, B extends z.ZodObject, X extends z.ZodRawShape> (
    screenOptions: S,
    blockOptions: B,
    entities: Entities,
    extras: X,
) {

    const tree = treeShapes(blockOptions);
    const contents = z.strictObject({
        ...extras,
        name: key,
        path,
        title: specText,
        label: specText.optional(),
        icon: key.optional(),
        entity: entityShape(entities).optional(),
    });
    const screen = z.strictObject({
        contents,
        options: screenOptions.partial().optional(),
        access: accessShape.optional(),
        redirect: path.optional(),
        blocks: z.array(tree.block).max(100),
    });
    const schema = z.strictObject({ screens: z.array(screen) });

    return { contents, screen, schema, tree };

}
