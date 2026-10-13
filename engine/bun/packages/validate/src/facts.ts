import type { z } from "zod";

export type FieldKind =
    | "text"
    | "email"
    | "phone"
    | "password"
    | "number"
    | "integer"
    | "boolean"
    | "date"
    | "datetime"
    | "choice"
    | "localized"
    | "file"
    | "list"
    | "object"
    | "unknown";
export type FieldFact = {
    name: string;
    kind: FieldKind;
    required: boolean;
    nullable: boolean;
    choices?: string[] | undefined;
    min?: number | undefined;
    max?: number | undefined;
};

type Check = {
    check?: string;
    minimum?: number;
    maximum?: number;
    value?: number;
    inclusive?: boolean;
    format?: string;
};
type Def = {
    type: string;
    format?: string;
    checks?: { _zod: { def: Check } }[];
    entries?: Record<string, unknown>;
    innerType?: Inner;
    in?: Inner;
};
type Inner = { _zod: { def: Def }; meta?: () => { kind?: unknown } | undefined };

const formats: Record<string, FieldKind> = { email: "email", date: "date", datetime: "datetime" };
const kinds: Record<string, FieldKind> = {
    string: "text",
    number: "number",
    boolean: "boolean",
    enum: "choice",
    file: "file",
    array: "list",
    object: "object",
    record: "object",
};
const known: readonly FieldKind[] = [
    "text",
    "email",
    "phone",
    "password",
    "number",
    "integer",
    "boolean",
    "date",
    "datetime",
    "choice",
    "localized",
    "file",
    "list",
    "object",
];

function unwrap(schema: Inner): { inner: Inner; required: boolean; nullable: boolean } {
    let inner = schema;
    let required = true;
    let nullable = false;

    for (let depth = 0; depth < 10; depth += 1) {
        const def = inner._zod.def;

        if (def.type === "optional" || def.type === "default") required = false;
        else if (def.type === "nullable") nullable = true;
        else if (def.type !== "pipe") break;

        const next = def.innerType ?? def.in;

        if (!next) break;

        inner = next;
    }

    return { inner, required, nullable };
}
function bounds(def: Def): { min?: number; max?: number } {
    const found: { min?: number; max?: number } = {};

    for (const { _zod } of def.checks ?? []) {
        const check = _zod.def;

        if (check.check === "min_length" && check.minimum !== undefined) found.min = check.minimum;
        if (check.check === "max_length" && check.maximum !== undefined) found.max = check.maximum;
        if (check.check === "greater_than" && check.value !== undefined)
            found.min = check.inclusive ? check.value : check.value + 1;
        if (check.check === "less_than" && check.value !== undefined)
            found.max = check.inclusive ? check.value : check.value - 1;
    }

    return found;
}
function kindOf(schema: Inner, def: Def): FieldKind {
    const declared = schema.meta?.()?.kind;

    if (typeof declared === "string" && known.includes(declared as FieldKind)) return declared as FieldKind;
    if (def.type === "string" && def.format && formats[def.format]) return formats[def.format] as FieldKind;
    if (def.type === "number" && def.checks?.some(({ _zod }) => _zod.def.check === "number_format")) return "integer";

    return kinds[def.type] ?? "unknown";
}
/**
 * What a form needs to know about every field of an object schema: its kind, whether it must be
 * given, whether null is accepted, its choices and its bounds. A `meta({ kind })` on a schema
 * names its kind outright (password, phone, localized).
 */
export function fieldFacts(schema: z.ZodType): FieldFact[] {
    const shape = (schema as z.ZodType & { shape?: Record<string, z.ZodType> }).shape;

    if (!shape) return [];

    return Object.entries(shape).map(([name, field]) => {
        const { inner, required, nullable } = unwrap(field as unknown as Inner);
        const def = inner._zod.def;
        const kind = kindOf(inner, def);
        const choices = def.type === "enum" && def.entries ? Object.keys(def.entries) : undefined;
        const { min, max } = bounds(def);

        return {
            name,
            kind,
            required,
            nullable,
            ...(choices ? { choices } : {}),
            ...(min === undefined ? {} : { min }),
            ...(max === undefined ? {} : { max }),
        };
    });
}
