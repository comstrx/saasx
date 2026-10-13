import * as z from "./z.ts";

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
    shape?: Record<string, unknown>;
    innerType?: Inner;
    in?: Inner;
};
type Inner = { _zod: { def: Def } };

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

function unwrap ( schema: Inner ): { inner: Inner; required: boolean; nullable: boolean } {

    let inner = schema;
    let required = true;
    let nullable = false;

    for ( let depth = 0; depth < 10; depth += 1 ) {

        const def = inner._zod.def;

        if ( def.type === "optional" || def.type === "default" ) required = false;
        else if ( def.type === "nullable" ) nullable = true;
        else if ( def.type !== "pipe" ) break;

        const next = def.innerType ?? def.in;

        if ( !next ) break;

        inner = next;

    }

    return { inner, required, nullable };

}
function bounds ( def: Def ): { min?: number; max?: number } {

    const found: { min?: number; max?: number } = {};

    for ( const { _zod } of def.checks ?? [] ) {

        const check = _zod.def;

        if ( check.check === "min_length" && check.minimum !== undefined ) found.min = check.minimum;
        if ( check.check === "max_length" && check.maximum !== undefined ) found.max = check.maximum;

        if ( check.check === "greater_than" && check.value !== undefined )
            found.min = check.inclusive ? check.value : check.value + 1;

        if ( check.check === "less_than" && check.value !== undefined )
            found.max = check.inclusive ? check.value : check.value - 1;

    }

    return found;

}
function kindOf ( schema: Inner, def: Def ): FieldKind {

    const declared = (z.globalRegistry.get(schema as never) as { kind?: unknown } | undefined)?.kind;

    if ( typeof declared === "string" && known.includes(declared as FieldKind) ) return declared as FieldKind;
    if ( def.type === "string" && def.format && formats[def.format] ) return formats[def.format] as FieldKind;
    if ( def.type === "number" && def.checks?.some(({ _zod }) => _zod.def.check === "number_format") ) return "integer";

    return kinds[def.type] ?? "unknown";

}
function facts ( shape: Record<string, unknown>, prefix: string, within: boolean ): FieldFact[] {

    return Object.entries(shape).flatMap(( [key, field] ) => {

        const name = `${prefix}${key}`;
        const { inner, required, nullable } = unwrap(field as unknown as Inner);
        const def = inner._zod.def;
        const kind = kindOf(inner, def);

        if ( kind === "object" && def.type === "object" && def.shape )
            return facts(def.shape, `${name}.`, within && required);

        const choices = def.type === "enum" && def.entries ? Object.keys(def.entries) : undefined;
        const { min, max } = bounds(def);

        return [
            {
                name,
                kind,
                required: within && required,
                nullable,
                ...(choices ? { choices } : {}),
                ...(min === undefined ? {} : { min }),
                ...(max === undefined ? {} : { max }),
            },
        ];

    });

}
export function fieldFacts ( schema: z.ZodType ): FieldFact[] {

    const shape = (schema as z.ZodType & { shape?: Record<string, unknown> }).shape;

    return shape ? facts(shape, "", true) : [];

}
