import { describe, expect, expectTypeOf, test } from "bun:test";
import {
    assert,
    email,
    fieldFacts,
    issuesOf,
    localized,
    parse,
    password,
    phone,
    rulesOf,
    shapeKeys,
    z,
} from "@engine/validate";

describe("validate", () => {
    test("parse answers field errors as an input failure", () => {
        const result = parse(z.object({ email, phone }), { email: "x", phone: "1" });

        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.failure.kind).toBe("input");
            expect(Object.keys(result.failure.errors).sort()).toEqual(["email", "phone"]);
        }
        expect(() => assert(z.number(), "x")).toThrow();
    });
    test("issues map to dotted paths and shape keys list an object schema", () => {
        const result = z.object({ a: z.object({ b: z.number() }) }).safeParse({ a: { b: "x" } });

        expect(result.success).toBe(false);
        if (!result.success) expect(issuesOf(result.error)).toEqual({ "a.b": [expect.any(String)] });
        expect(shapeKeys(z.object({ x: z.number(), y: z.string() }))).toEqual(["x", "y"]);
        expect(shapeKeys(z.string())).toEqual([]);
    });
});

describe("fieldFacts", () => {
    test("reads the kind, requirement and bounds of every input field", () => {
        const facts = fieldFacts(
            z.object({
                name: z.string().min(2).max(50),
                type: z.enum(["hotel", "room"]),
                stock: z.number().int().positive().optional(),
                featured: z.boolean().nullish(),
                starts: z.iso.date().optional(),
                at: z.iso.datetime({ offset: true }).optional(),
                email: email.optional(),
                phone: phone.optional(),
                secret: password,
                title: localized(),
                image: z.file().optional(),
                tags: z.array(z.string()).optional(),
                extra: z.object({ a: z.string() }).optional(),
                id: z.coerce.number().int().positive(),
                page: z.number().default(1),
            }),
        );
        const byName = Object.fromEntries(facts.map((fact) => [fact.name, fact]));

        expect(facts.map((fact) => fact.name)).toEqual([
            "name",
            "type",
            "stock",
            "featured",
            "starts",
            "at",
            "email",
            "phone",
            "secret",
            "title",
            "image",
            "tags",
            "extra.a",
            "id",
            "page",
        ]);
        expect(byName.name).toEqual({ name: "name", kind: "text", required: true, nullable: false, min: 2, max: 50 });
        expect(byName.type).toEqual({
            name: "type",
            kind: "choice",
            required: true,
            nullable: false,
            choices: ["hotel", "room"],
        });
        expect(byName.stock).toEqual({ name: "stock", kind: "integer", required: false, nullable: false, min: 1 });
        expect(byName.featured).toEqual({ name: "featured", kind: "boolean", required: false, nullable: true });
        expect(byName.starts?.kind).toBe("date");
        expect(byName.at?.kind).toBe("datetime");
        expect(byName.email?.kind).toBe("email");
        expect(byName.phone?.kind).toBe("phone");
        expect(byName.secret?.kind).toBe("password");
        expect(byName.title?.kind).toBe("localized");
        expect(byName.image?.kind).toBe("file");
        expect(byName.tags?.kind).toBe("list");
        expect(byName["extra.a"]).toEqual({ name: "extra.a", kind: "text", required: false, nullable: false });
        expect(byName.id).toEqual({ name: "id", kind: "integer", required: true, nullable: false, min: 1 });
        expect(byName.page).toEqual({ name: "page", kind: "number", required: false, nullable: false });
    });
    test("a non-object schema has no fields", () => {
        expect(fieldFacts(z.string())).toEqual([]);
    });
});
describe("rulesOf", () => {
    test("zod issues become rule keys with their parameters, never sentences", () => {
        const result = z
            .object({
                title: z.string().min(2),
                stock: z.number().max(9),
                kind: z.enum(["a", "b"]),
                mail: z.email(),
                flag: z.boolean(),
            })
            .safeParse({ title: "x", stock: 10, kind: "c", mail: "nope", flag: "yes" }, { reportInput: true });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(rulesOf(result.error)).toEqual({
                title: [{ rule: "min", params: { minimum: 2 } }],
                stock: [{ rule: "max", params: { maximum: 9 } }],
                kind: [{ rule: "choice", params: { choices: "a, b" } }],
                mail: [{ rule: "format", params: { format: "email" } }],
                flag: [{ rule: "type", params: { expected: "boolean" } }],
            });
        }
    });
});

describe("z, the classic chain over zod/mini", () => {
    test("strict objects refuse unknown keys, loose ones keep them, and both are mini objects", () => {
        const strict = z.strictObject({ id: z.number() });
        const loose = strict.passthrough();

        expect(z.safeParse(strict, { id: 1, extra: true }).success).toBe(false);
        expect(z.safeParse(loose, { id: 1, extra: true })).toEqual({ success: true, data: { id: 1, extra: true } });
        expect(strict instanceof z.ZodObject).toBe(true);
        expect(loose instanceof z.ZodObject).toBe(true);
        expect(strict.partial().extend({ name: z.string() }).shape).toHaveProperty("name");
    });
    test("min and max read lengths on strings and arrays and bounds on numbers", () => {
        expect(z.safeParse(z.string().min(2), "a").success).toBe(false);
        expect(z.safeParse(z.array(z.string()).max(1), ["a", "b"]).success).toBe(false);
        expect(z.safeParse(z.number().min(2).max(3), 2.5).success).toBe(true);
        expect(z.safeParse(z.number().int().positive(), -1).success).toBe(false);
    });
    test("meta lands in the global registry and wrappers unwrap to the schema they hold", () => {
        const phone = z.string().meta({ kind: "phone" });
        const held = phone.default("+1").unwrap();

        expect(z.globalRegistry.get(phone)).toEqual({ kind: "phone" });
        expect(z.globalRegistry.get(held)).toEqual({ kind: "phone" });
        expect(z.record(z.string(), z.number()).valueType instanceof z.ZodObject).toBe(false);
        expect(z.safeParse(z.record(z.string(), z.number()).valueType, 1).success).toBe(true);
    });
    test("a schema behind a type parameter keeps its own shape through the chain", () => {
        const wrap = <S extends z.ZodObject>(schema: S) => schema.nullable().default(null);
        const wrapped = wrap(z.object({ id: z.number() }));

        expectTypeOf<z.output<typeof wrapped>>().toEqualTypeOf<{ id: number } | null>();
        expect(z.safeParse(wrapped, undefined)).toEqual({ success: true, data: null });
    });
});

describe("fieldFacts over nested objects", () => {
    test("an object input flattens to dotted leaves whose requirement follows the parent", () => {
        const facts = fieldFacts(
            z.object({
                name: z.string(),
                address: z.object({ city: z.string().min(2), zip: z.string().optional() }).optional(),
                tags: z.record(z.string(), z.string()),
            }),
        );

        expect(facts.map((field) => [field.name, field.kind, field.required, field.min])).toEqual([
            ["name", "text", true, undefined],
            ["address.city", "text", false, 2],
            ["address.zip", "text", false, undefined],
            ["tags", "object", true, undefined],
        ]);
    });
});
